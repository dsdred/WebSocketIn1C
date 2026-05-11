param(
  [string]$OutputDir = (Join-Path $PSScriptRoot 'cert')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-DerLength {
  param([int]$Length)

  if ($Length -lt 128) {
    return ,([byte[]]@([byte]$Length))
  }

  $bytes = New-Object System.Collections.Generic.List[byte]
  $remaining = $Length

  while ($remaining -gt 0) {
    $bytes.Insert(0, [byte]($remaining -band 0xff))
    $remaining = [math]::Floor($remaining / 256)
  }

  return ,([byte[]]([byte[]]@([byte](0x80 -bor $bytes.Count)) + $bytes.ToArray()))
}

function Trim-UnsignedIntegerBytes {
  param([byte[]]$Bytes)

  if (-not $Bytes -or $Bytes.Length -eq 0) {
    return ,([byte[]](0))
  }

  $index = 0

  while ($index -lt ($Bytes.Length - 1) -and $Bytes[$index] -eq 0) {
    $index++
  }

  $length = $Bytes.Length - $index
  $result = New-Object byte[] $length
  [Array]::Copy($Bytes, $index, $result, 0, $length)

  if (($result[0] -band 0x80) -ne 0) {
    return ,([byte[]]([byte[]]@([byte]0x00) + $result))
  }

  return ,([byte[]]$result)
}

function ConvertTo-DerInteger {
  param([byte[]]$Bytes)

  $normalized = Trim-UnsignedIntegerBytes -Bytes $Bytes
  return ,([byte[]]([byte[]]@([byte]0x02) + (ConvertTo-DerLength $normalized.Length) + $normalized))
}

function ConvertTo-DerSequence {
  param([byte[]]$Bytes)

  return ,([byte[]]([byte[]]@([byte]0x30) + (ConvertTo-DerLength $Bytes.Length) + $Bytes))
}

function ConvertTo-RsaPrivateKeyDer {
  param([System.Security.Cryptography.RSAParameters]$Parameters)

  $body = New-Object System.Collections.Generic.List[byte]

  foreach ($component in @(
      [byte[]](0),
      $Parameters.Modulus,
      $Parameters.Exponent,
      $Parameters.D,
      $Parameters.P,
      $Parameters.Q,
      $Parameters.DP,
      $Parameters.DQ,
      $Parameters.InverseQ
    )) {
    $encoded = ConvertTo-DerInteger -Bytes $component
    $body.AddRange($encoded)
  }

  return ,([byte[]](ConvertTo-DerSequence -Bytes $body.ToArray()))
}

function ConvertTo-Pem {
  param(
    [string]$Label,
    [byte[]]$Bytes
  )

  $base64 = [Convert]::ToBase64String($Bytes)
  $builder = New-Object System.Text.StringBuilder

  [void]$builder.AppendLine("-----BEGIN $Label-----")

  for ($index = 0; $index -lt $base64.Length; $index += 64) {
    $chunkLength = [Math]::Min(64, $base64.Length - $index)
    [void]$builder.AppendLine($base64.Substring($index, $chunkLength))
  }

  [void]$builder.AppendLine("-----END $Label-----")
  return $builder.ToString()
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$keyPath = Join-Path $OutputDir 'key.pem'
$certPath = Join-Path $OutputDir 'cert.pem'

$rsa = [System.Security.Cryptography.RSA]::Create(2048)
$subject = New-Object System.Security.Cryptography.X509Certificates.X500DistinguishedName 'CN=localhost'
$request = New-Object System.Security.Cryptography.X509Certificates.CertificateRequest(
  $subject,
  $rsa,
  [System.Security.Cryptography.HashAlgorithmName]::SHA256,
  [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
)

$request.CertificateExtensions.Add(
  (New-Object System.Security.Cryptography.X509Certificates.X509BasicConstraintsExtension($false, $false, 0, $false))
)
$request.CertificateExtensions.Add(
  (New-Object System.Security.Cryptography.X509Certificates.X509KeyUsageExtension(
      ([System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature -bor
        [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::KeyEncipherment),
      $true
    ))
)

$ekuCollection = New-Object System.Security.Cryptography.OidCollection
[void]$ekuCollection.Add((New-Object System.Security.Cryptography.Oid '1.3.6.1.5.5.7.3.1'))
$request.CertificateExtensions.Add(
  (New-Object System.Security.Cryptography.X509Certificates.X509EnhancedKeyUsageExtension($ekuCollection, $false))
)

$sanBytes = [byte[]](0x30, 0x0b, 0x82, 0x09, 0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x68, 0x6f, 0x73, 0x74)
$request.CertificateExtensions.Add(
  (New-Object System.Security.Cryptography.X509Certificates.X509Extension('2.5.29.17', $sanBytes, $false))
)
$request.CertificateExtensions.Add(
  (New-Object System.Security.Cryptography.X509Certificates.X509SubjectKeyIdentifierExtension($request.PublicKey, $false))
)

$certificate = $request.CreateSelfSigned(
  [System.DateTimeOffset]::UtcNow.AddMinutes(-5),
  [System.DateTimeOffset]::UtcNow.AddDays(365)
)

$privateKeyDer = ConvertTo-RsaPrivateKeyDer -Parameters ($rsa.ExportParameters($true))
$certificateDer = $certificate.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)

Set-Content -LiteralPath $keyPath -Value (ConvertTo-Pem -Label 'RSA PRIVATE KEY' -Bytes $privateKeyDer) -Encoding ascii
Set-Content -LiteralPath $certPath -Value (ConvertTo-Pem -Label 'CERTIFICATE' -Bytes $certificateDer) -Encoding ascii

if (-not (Test-Path -LiteralPath $keyPath) -or -not (Test-Path -LiteralPath $certPath)) {
  throw 'Certificate generation failed.'
}

Write-Host "Created $keyPath"
Write-Host "Created $certPath"
