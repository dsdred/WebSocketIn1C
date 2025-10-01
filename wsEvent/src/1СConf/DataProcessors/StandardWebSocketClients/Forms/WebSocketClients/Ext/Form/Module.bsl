&AtServer
Procedure FillTable()

	ClientsTable.Clear();
	
	For Each Client In WebSocketClients.GetClients() Do
		
		Row = ClientsTable.Add();
		Row.MetadataName = Client.Metadata.Name;
		Row.MetadataText = Client.Metadata.Presentation();
		Row.ClientKey = ?(Client.Predefined, "", Client.Key);
		Row.Predefined = Client.Predefined;
		Row.AutoConnect = Client.AutoConnect;
		Row.ServerURL = Client.ServerURL;
		
		Connection = Client.GetCurrentConnection();
		ConnectionState = ?(Connection = Undefined,
			WebSocketConnectionState.Closed,
			Connection.GetState());
		
		If ConnectionState = WebSocketConnectionState.Open Then
			Row.ConnectionStateID = 0;
			Row.ConnectionState = Nstr("ru = 'Открыто';SYS='WebSocketClients.StateOpen'", "ru");
		
		ElsIf ConnectionState = WebSocketConnectionState.Closed Then
			Row.ConnectionStateID = 1;
			Row.ConnectionState = Nstr("ru = 'Закрыто';SYS='WebSocketClients.StateClosed'", "ru");
		
		ElsIf ConnectionState = WebSocketConnectionState.Opening Then
			Row.ConnectionStateID = 2;
			Row.ConnectionState = Nstr("ru = 'Открывается';SYS='WebSocketClients.StateOpening'", "ru");
		
		ElsIf ConnectionState = WebSocketConnectionState.Closing Then
			Row.ConnectionStateID = 3;
			Row.ConnectionState = Nstr("ru = 'Закрывается';SYS='WebSocketClients.StateClosing'", "ru");
		EndIf;

	EndDo;

	ClientsTable.Sort("MetadataText, ClientKey");
	
EndProcedure

&AtClient
Procedure RefreshView()

	Rows = ClientsTable.FindRows(New Structure(
		"MetadataText, ClientKey", CurrentName, CurrentKey));
		
	If Rows.Count() > 0 Then
		Items.ClientsTable.CurrentRow = Rows[0].GetID();
	EndIf;
			
	Data = Items.ClientsTable.CurrentData;
	Items.ChangeClient.Enabled = Data <> Undefined;
	Items.RemoveClient.Enabled = Data <> Undefined AND NOT Data.Predefined;
	Items.ConnectDisconnect.Visible = Data <> Undefined;
	Items.ConnectDisconnect.Title = ?(Data <> Undefined AND Data.ConnectionStateID = 1, // closed
		NStr("ru='Подключить';SYS='WebSocketClients.ItemHeaderConnect'", "ru"),
		NStr("ru='Отключить';SYS='WebSocketClients.ItemHeaderDisconnect'", "ru"));
	
EndProcedure

&AtClient
Procedure RefreshAll()
	
	FillTable();
	RefreshView();
	RefreshDelay = Min(30, RefreshDelay + 1);
	AttachIdleHandler("RefreshAll", RefreshDelay, True);
	
EndProcedure

&AtClient
Procedure OnOpen(Cancel)
	
	RefreshDelay = 0;
	RefreshAll();
	
EndProcedure

&AtClient
Procedure Refresh(Command)
	
	RefreshDelay = 0;
	RefreshAll();
	
EndProcedure

&AtClient
Procedure OnActivateRow(Item)

	Data = Items.ClientsTable.CurrentData;
	CurrentName = ?(Data <> Undefined, Data.MetadataText, "");
	CurrentKey = ?(Data <> Undefined, Data.ClientKey, "");
	RefreshView();
	
EndProcedure

&AtClient
Procedure AfterClientForm(Result, AddParameters) Export
	
	If Result = True Then
		RefreshDelay = 0;
		RefreshAll();
	EndIf;
	
EndProcedure

&AtClient
Procedure BeforeAddRow(Item, Cancel, Clone, Parent, Folder, Parameter)
	
	Cancel = True;
	Params = New Structure("MetadataName, ClientKey, Predefined", "", "", False);
	Form = GetForm("ExternalDataProcessor.StandardWebSocketClients.Form.WebSocketClient", Params);
	Form.OnCloseNotifyDescription = New NotifyDescription("AfterClientForm", ThisObject);
	Form.Open();
	
EndProcedure

&AtClient
Procedure BeforeRowChange(Item, Cancel)

	Cancel = True;
	Data = Items.ClientsTable.CurrentData;
	Params = New Structure("MetadataName, ClientKey, Predefined", Data.MetadataName, Data.ClientKey, Data.Predefined);
	Form = GetForm("ExternalDataProcessor.StandardWebSocketClients.Form.WebSocketClient", Params);
	Form.OnCloseNotifyDescription = New NotifyDescription("AfterClientForm", ThisObject);
	Form.Open();
	
EndProcedure

&AtClient
Procedure Select(Item, SelectedString, Field, StandardProcessing)

	StandardProcessing = False;
	Data = Items.ClientsTable.CurrentData;
	Params = New Structure("MetadataName, ClientKey, Predefined", Data.MetadataName, Data.ClientKey, Data.Predefined);
	Form = GetForm("ExternalDataProcessor.StandardWebSocketClients.Form.WebSocketClient", Params);
	Form.OnCloseNotifyDescription = New NotifyDescription("AfterClientForm", ThisObject);
	Form.Open();
	
EndProcedure

&AtServer
Procedure DeleteAtServer(ClientKey)

	Client = WebSocketClients.FindByKey(ClientKey);
	If Client <> Undefined Then
		Client.Delete();
		FillTable();
	EndIf;
	
EndProcedure

&AtClient
Async Procedure DoDeleteRow(Item)

	Result = Await DoQueryBoxAsync(
		NStr("ru='Удалить клиента?';SYS='WebSocketClients.RemoveDialogOption'", "ru"), 
	    QuestionDialogMode.YesNo, , DialogReturnCode.No);
		
	If Result = DialogReturnCode.Yes Then
		Data = Items.ClientsTable.CurrentData;
		DeleteAtServer(Data.ClientKey);
		RefreshView();
	EndIf;
				 
EndProcedure

&AtClient
Procedure BeforeDeleteRow(Item, Cancel)

	Cancel = True;
	DoDeleteRow(Item);
	
EndProcedure

&AtServerNoContext
Procedure ConnectAtServer(MetadataName, ClientKey, Predefined, Connect)
	
	MetadataClient = Metadata.WebSocketClients.Find(MetadataName);
	Client = ?(Predefined AND MetadataClient <> Undefined,
		WebSocketClients.FindPredefined(MetadataClient),
		WebSocketClients.FindByKey(ClientKey));
		
	If Client <> Undefined AND Connect Then
		Client.Connect();
	ElsIf Client <> Undefined Then
		Client.Disconnect();
	EndIf;
	
EndProcedure

&AtClient
Procedure Connect(Command)
	
	Data = Items.ClientsTable.CurrentData;
	ConnectAtServer(
		Data.MetadataName,
		Data.ClientKey,
		Data.Predefined,
		Data.ConnectionStateID = 1);
		
	RefreshDelay = 0;
	RefreshAll();
	
EndProcedure
