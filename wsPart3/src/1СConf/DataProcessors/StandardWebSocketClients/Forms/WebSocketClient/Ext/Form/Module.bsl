&AtServer
Procedure OnCreateAtServer(Cancel, StandardProcessing)
	
	For Each MetadataClient In Metadata.WebsocketClients Do
	
		Items.MetadataName.ChoiceList.Add(MetadataClient.Name, MetadataClient.Presentation());
		
	EndDo;
	
	For Each IBUser In InfoBaseUsers.GetUsers() Do
		
		Items.IBUserName.ChoiceList.Add(IBUser.Name, ?(IBUser.FullName <> "", IBUser.FullName, IBUser.Name));
		
	EndDo;
	
	Items.ClientKey.Enabled = False;
	Items.Predefined.Enabled = False;
	Items.MainSettings.Enabled = False;
	Items.ConnectionParameters.Enabled = False;
	Items.WriteAndClose.Enabled = False;
	Items.Write.Enabled = False;
	
	ClientKey = Parameters.ClientKey;
	Predefined = Parameters.Predefined;
	
	If Parameters.MetadataName <> "" Then
		
		MetadataClient = Metadata.WebSocketClients.Find(Parameters.MetadataName);
		MetadataName = MetadataClient.Name;
		
		Client = ?(Predefined,
			WebSocketClients.FindPredefined(MetadataClient),
			WebSocketClients.FindByKey(ClientKey));
		
		PresetByClient(Client);
		
		Items.MetadataName.Enabled = False;
		Items.MainSettings.Enabled = True;
		Items.ConnectionParameters.Enabled = True;
		Items.WriteAndClose.Enabled = True;
		Items.Write.Enabled = True;

	EndIf;
	
EndProcedure

&AtServer
Procedure PresetByClient(Client)

	AutoConnect = Client.AutoConnect;
	ServerURL = Client.ServerURL;
	Params = Client.ConnectionParameters;
	User = Params.User;
	Password = Params.Password;
	UseOSProxy = Params.UseOSProxy;
	UseOSAuthentication = Params.UseOSAuthentication;
	Timeout = Params.Timeout;
	HeadersTable.Clear();
	For Each Header In Params.Headers Do
		HeadersTableRow = HeadersTable.Add();
		HeadersTableRow["HeaderKey"] = Header.Key;
		HeadersTableRow["HeaderValue"] = Header.Value;
	EndDo;

EndProcedure

&AtServer
Procedure MetadataNameOnChangeAtServer()

	MetadataClient = Metadata.WebSocketClients.Find(MetadataName);
	Client = WebSocketClients.CreateClient(MetadataClient, String(new UUID));
	PresetByClient(Client);
	Items.ClientKey.Enabled = True;

EndProcedure

&AtClient
Procedure MetadataNameOnChange(Item)
	
	If MetadataName <> "" Then
		MetadataNameOnChangeAtServer();
	EndIf;
	
EndProcedure

&AtClient
Procedure ClientKeyOnChange(Элемент)

	On = ClientKey <> "";
	Items.MainSettings.Enabled = On;
	Items.ConnectionParameters.Enabled = On;
	Items.WriteAndClose.Enabled = On;
	Items.Write.Enabled = On;
	
EndProcedure

&AtServer
Procedure WriteAtServer()

	MetadataClient = Metadata.WebSocketClients.Find(MetadataName);
	Client = ?(Predefined,
		WebSocketClients.FindPredefined(MetadataClient),
		WebSocketClients.FindByKey(ClientKey));
		
	If Client = Undefined Then
		Client = WebSocketClients.CreateClient(MetadataClient, ClientKey);
	EndIf;
		
	Params = Client.ConnectionParameters;
	
	Client.AutoConnect = AutoConnect;
	Client.ServerURL = ServerURL;
	Params.User = User;
	Params.Password = Password;
	Params.UseOSProxy = UseOSProxy;
	Params.UseOSAuthentication = UseOSAuthentication;
	Params.Timeout = Timeout;
	Params.Headers.Clear();
	For Each Row In HeadersTable Do
		Params.Headers.Insert(
			Row["HeaderKey"],
			Row["HeaderValue"]);
	EndDo;
	
	Client.Write();
	
EndProcedure

&AtClient
Procedure Write(Command)
	
	WriteAtServer();
	
EndProcedure

&AtClient
Procedure WriteAndClose(Command)
	
	WriteAtServer();
	Close(True);
	
EndProcedure


&AtClient
Procedure Cancel(Command)
	
	Close();
	
EndProcedure
