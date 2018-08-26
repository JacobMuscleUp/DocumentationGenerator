@echo off

set arg1=%1
set arg2=%2

set path=%path%;%arg1%

cd "%arg2%"
doxygen -g
rem pause
echo GENERATE_LATEX=NO >> Doxyfile
echo EXTRACT_ALL=YES >> Doxyfile
echo EXTRACT_PRIVATE=YES >> Doxyfile
echo RECURSIVE=YES >> Doxyfile

doxygen Doxyfile
pause