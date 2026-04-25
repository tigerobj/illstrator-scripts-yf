Option Explicit

Dim fso, scriptFolder, jsxName, jsxPath
Dim illustratorApp

Set fso = CreateObject("Scripting.FileSystemObject")
scriptFolder = fso.GetParentFolderName(WScript.ScriptFullName)
jsxName = ChrW(&H6E2C) & ChrW(&H8A66) & ChrW(&H7A0B) & ChrW(&H5F0F) & ".jsx"
jsxPath = fso.BuildPath(scriptFolder, jsxName)

If Not fso.FileExists(jsxPath) Then
    MsgBox "Cannot find JSX file:" & vbCrLf & jsxPath, vbCritical, "Run Illustrator JSX"
    WScript.Quit 1
End If

On Error Resume Next
Set illustratorApp = CreateObject("Illustrator.Application")

If Err.Number <> 0 Then
    WScript.Quit 2
End If

Err.Clear
illustratorApp.DoJavaScriptFile jsxPath

If Err.Number <> 0 Then
    WScript.Quit 3
End If
