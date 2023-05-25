Reporter.Filter = 1
country = DataTable("Country")
language = DataTable("Language")
clusterGlobal = DataTable("Cluster")

For i = 1 To DataTable.LocalSheet.GetRowCount
	DataTable.LocalSheet.SetCurrentRow(i)
	clusterLocal = DataTable("Cluster", dtLocalSheet)
	If clusterLocal = clusterGlobal Then
		URL = DataTable("URL", dtLocalSheet) 
		user =   Datatable("Username", dtLocalSheet) 
		password =  Datatable("Password", dtLocalSheet)
		Exit For
	End If
Next

SystemUtil. CloseProcessByName "chrome.exe"
SystemUtil.Run "C:\Program Files\Google\Chrome\Application\chrome.exe", "--silent-debugger-extension-api" & " -incognito " & URL
'Browser("CCHBC eshop").Navigate URL
Browser("CCHBC eshop").Maximize

If Browser("CCHBC eshop").Page("PreLogin").WebElement("Select Country & Language").Exist(7) Then
	Reporter.Filter = 0
	Browser("CCHBC eshop").Page("PreLogin").WebList("SelectCountry").Select country
	Browser("CCHBC eshop").Page("PreLogin").WebList("SelectLanguage").Select language
	Browser("CCHBC eshop").Page("PreLogin").WebButton("Continue").Click
	Reporter.Filter = 1
End  If


If NOT Browser("CCHBC eshop").Page("PreLogin").Link("Login").Exist(5) Then
	Reporter.ReportEvent micFail, "Login not available","Login not available", pathScreenshot(Browser("CCHBC eshop"))
	ExitTest
End If

Reporter.Filter = 0
Browser("CCHBC eshop").Page("PreLogin").Link("Login").Click
Reporter.Filter = 1
If NOT Browser("CCHBC eshop").Page("Login").Exist(3) Then
	Reporter.ReportEvent micFail, "Login page not available","Login page not available", pathScreenshot(Browser("CCHBC eshop"))
	ExitTest
End If
If Browser("CCHBC eshop").Page("Login").WebButton("Cookies_Allow All").Exist(3) Then
	Browser("CCHBC eshop").Page("Login").WebButton("Cookies_Allow All").Click
End  If
Reporter.Filter = 0
Browser("CCHBC eshop").Page("Login").WebEdit("Username").Set user
Browser("CCHBC eshop").Page("Login").WebEdit("Password").SetSecure password
Browser("CCHBC eshop").Page("Login").WebButton("Login").Click
Reporter.Filter = 1
Call pageSync()


If Browser("CCHBC eshop").Page("Home Page").Exist(3) Then
	Reporter.Filter = 0
	Reporter.ReportEvent micPass, "Login sucessful", "Login sucessful for user " & user, pathScreenshot(Browser("CCHBC eshop"))
	Reporter.Filter = 1
Else
	Reporter.ReportEvent micFail ,"Login failed", "Login failed for user " & user, pathScreenshot(Browser("CCHBC eshop"))
	ExitTest
End If

'some invoice msg for Poland
If Browser("CCHBC eshop").Page("Home Page").WebButton("Close").Exist(3) Then
	Browser("CCHBC eshop").Page("Home Page").WebButton("Close").Click
End If

Browser("CCHBC eshop").Page("Home Page").Link("Products").Click
Call pageSync()

qtyInCart = Browser("CCHBC eshop").Page("Page").WebElement("Cart Count").GetROProperty("outertext")

Browser("CCHBC eshop").Page("Product List Page").WebButton("ADD TO CART").Click
Browser("CCHBC eshop").Page("Product List Page").WebButton("+").Click @@ script infofile_;_ZIP::ssf3.xml_;_
wait 2


If NOT (CInt(Browser("CCHBC eshop").Page("Page").WebElement("Cart Count").GetROProperty("outertext")) - CInt(qtyInCart) > 0) Then
	Reporter.ReportEvent micFail, "Cart count not updated", " Cart count not updated"
End If




Browser("CCHBC eshop").Page("Page").Image("CCHellenic Logo").Click

Browser("CCHBC eshop").Page("Page").WebButton("User Icon").Click
Browser("CCHBC eshop").Page("Page").WebButton("Logout").Click
Browser("CCHBC eshop").CloseAllTabs




'@Description: Waits for the page to load and the loading circle to disappear
'Max time = 2 minutes
'TODO:report if not loaded
Function pageSync()
	PAGE_SYNC_WAIT_TIME = 60
	timePassed = 0
	loadingTimePassed = 0
	With Browser("CCHBC eshop").Page("Page")
		While (NOT .Object.readyState =  "complete") AND timePassed < PAGE_SYNC_WAIT_TIME
			wait 1
			timePassed = timePassed + 1
		Wend	
		While .WebElement("Loading Circle").Exist(1) AND loadingTimePassed < PAGE_SYNC_WAIT_TIME
			.RefreshObject
			wait 1
			loadingTimePassed = loadingTimePassed + 1
		Wend	
	End  With	
End Function

'@Description: Creates a screenshot in the report path and returns the path
'objToCapture - any object that have CaptureBitmap method
Function pathScreenshot(objToCapture)
        screenImgPath = Reporter.ReportPath & "\" & "screenshot.bmp"
        objToCapture.CaptureBitmap screenImgPath, True
        pathScreenshot = screenImgPath
End Function
