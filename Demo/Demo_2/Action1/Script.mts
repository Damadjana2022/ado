SystemUtil. CloseProcessByName "msedge.exe"

SystemUtil.Run "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" , "-InPrivate"
Browser("Edge").Navigate "www.google.com"
wait 1
Browser("Edge").Sync
Reporter.ReportEvent micPass, "GOOGLE is available",""
Browser("Edge").Navigate "www.yahoo.bg"
wait 1
Browser("Edge").Sync
Reporter.ReportEvent micPass, "YAHOO is available",""
SystemUtil. CloseProcessByName "msedge.exe"
