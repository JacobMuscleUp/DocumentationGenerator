@echo off

set arg1=%1
set arg2=%2
set arg3=%3
set arg4=%4
set arg1=%arg1:"=%
rem set "prog=%arg1%\jekyll_build.bat"
set "prog=jekyll_build.bat"
set "cmd="%prog%" %arg2% %arg3% %arg4%"

copy "script\jekyll_build.bat" "%arg1%"
echo %cmd%
cd "%arg1%"
%cmd%