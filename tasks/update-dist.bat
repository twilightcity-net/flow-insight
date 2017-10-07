@ECHO off
REM author: 1-14x0r

:SET_VARS
SET	"PRJ_DIR=%cd%"
SET "DIST_DIR=%cd%\dist\win-unpacked"
SET "DIST_RESOURCES_DIR=%DIST_DIR%\resources"
SET "ASAR=app.asar"
SET "ASAR_DIR=%DIST_RESOURCES_DIR%\app.asar"
SET "ASAR_EXTRACTED=app.asar.extracted"
SET "ASAR_EXTRACTED_DIR=%DIST_RESOURCES_DIR%\%ASAR_EXTRACTED%"
SET "BUILD_DIR=%PRJ_DIR%\build"

ECHO Updating Project Distribution Sources...

:CHECK_PROJECT_ROOT
IF EXIST %PRJ_DIR%\package.json (
	GOTO CHECK_EXTRACTED_SOURCES
) ELSE (
	ECHO Must execute in project root directory.
	GOTO END
)

:CHECK_EXTRACTED_SOURCES
IF EXIST %ASAR_EXTRACTED_DIR% (
	GOTO COPY_BUILD
) ELSE (
	GOTO PROCESS_ASAR
)

:PROCESS_ASAR
IF EXIST %ASAR_DIR% (
    ECHO Extracting %ASAR_DIR%...
	asar extract %ASAR_DIR% %ASAR_EXTRACTED_DIR%
	GOTO COPY_BUILD
	
) ELSE (
    ECHO Project not distributed: Try 'yarn release' first.
	GOTO END
)


:COPY_BUILD
ECHO removing build dir..
rd /s /q %ASAR_EXTRACTED_DIR%\build
ECHO copy build dir...
robocopy %BUILD_DIR% %ASAR_EXTRACTED_DIR%\build /MIR
GOTO PACK_ASAR

:PACK_ASAR
ECHO Packing %ASAR%...
asar pack %ASAR_EXTRACTED_DIR% %ASAR_DIR% && ECHO Running MetaOS... && %DIST_DIR%\MetaOS.exe && GOTO END

:END
@ECHO on