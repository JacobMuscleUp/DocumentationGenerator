rem cmd /v:on

setlocal enabledelayedexpansion
@echo off

set arg1=%1
set arg2=%2
set arg3=%3

set "inputFiles=%arg1%\*.md"
set "outputDir=%arg2%\"

set /A counter=0
for %%i in ("%inputFiles%") do (
    set /A counter+=1
    move "%%i" %outputDir%

    if /I "!counter!" equ "%arg3%" (
        set /A counter=0
        start /wait "jekyll" cmd /c jekyll build --incremental
    )
)
start /wait "jekyll" cmd /c jekyll build --incremental