// Global Declarations

var dsm5Diagnoses = [];
var dsm5Regex;
var arrDiagnosis = [];
var arrPrimaryDiagnosisLegend = []
var arrData = [];

var arrDataToBePrinted = [
    "Clinic",
    "Psychiatrist",
    "Psychiatry Resident (PM)",
    "Elective Student (PM)",
    "SCC",
    "Patient Name",
    "Type of Appt",
    "Referring Physician",
    "Date Of Referral",
    "Date of Appointment",
    "Patient Attended",
    "Followup Required",
    "Referred To Share Care Counsellor",
    "Specialist Referral Required",
    "Primary Diagnosis",
    "Is There an Addictions Component",
    "Spoke to PCP (before visit/after visit)"
];

var arrDataToBePrintedBilling = [
    "Patient Details",
    "Name",
    "D.O.B",
    "Gender",
    "MHSC",
    "PHIN",
    "Date of Assessment",
    "Referring Physician",
    "Date of Referral",
    "final Description"
];

var arrDataToBeFetched = [
    "Name",
    "D.O.B",
    "Gender",
    "MHSC",
    "PHIN",
    "Date of Assessment",
    "Referring Physician",
    "Clinic",
    "Date of Referral",
    "Reason for Referral",
    "Psychiatric Assessment",   
    "ID",
    "History of Present Illness",
    "Past Psychiatric History",
    "Past Medical History",
    "Relevant Medications",
    "Allergies",
    "Family History",
    "Social History",
    "Legal History",
    "Mental Status Examination",
    "Impression",
    "Recommendations",
    "Shared Care Psychiatry Followup",
    "Subjective",
    "Past Medical History",
	"Functional History",
	"Cognitive Testing"
]

function downloadToFile(content, filename, contentType, ext){

    if(ext == 'txt'){
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        a.href= URL.createObjectURL(file);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    else if(ext == 'pdf'){
        var doc = new jsPDF();
        doc.setFontSize(9);
        pageHeight= doc.internal.pageSize.height;
        splittedContent = content.split("\n");
        y = 10;
        var lineHeight = 3;
        for(textContent in splittedContent){
            var strArr = doc.splitTextToSize(splittedContent[textContent], 190);
            if (y >= pageHeight){
                doc.addPage();
                y = 10
            }
            if(splittedContent[textContent].includes('***************** Next Report ******************')){
                doc.addPage();
                y = 10;
            }
            else{
                doc.text(strArr, 10, y);
            }
            if(strArr.length > 1){
                y = y + (lineHeight * strArr.length) + lineHeight;
            }
            else{
                y = y + lineHeight;
            }
        }
        doc.save(filename);
    }
    else if(ext=='doc'){
        // First, create a string with the contents of the document
        const separator = "***************** Next Report ******************";
        const docContents = "This is the contents of the first page." + separator + "<br clear=\"all\" style=\"page-break-before: always\" />This is the contents of the second page.";

        // Create a new Blob with the document contents
        const docBlob = new Blob([docContents], { type: "application/msword" });

        // Use the FileSaver.js library to save the Blob as a .doc file
        saveAs(docBlob, "mydoc.doc");
    } 
    else{
        // do else part
    }
};

function createContent(arrParam, tempArrBilling){
    var finalString = "";   
    for(val in arrDataToBePrinted){
        if(typeof arrParam[arrDataToBePrinted[val]] !== "undefined"){
            var finalString = finalString + arrDataToBePrinted[val] + ': ' + arrParam[arrDataToBePrinted[val]] + '\n\n';
        }
        else{
            var finalString = finalString + arrDataToBePrinted[val] + ': \n\n';
        }
    }
    if(document.querySelector(".main-rich-text-editor-section #ta-report").value == ''){
        document.querySelector(".main-rich-text-editor-section #ta-report").value = finalString;
    }
    else{
        document.querySelector(".main-rich-text-editor-section #ta-report").value += "\n\n****************** Next Report ******************\n\n" +finalString;
    }
    document.querySelector(".main-rich-text-editor-section ");

    var finalString = "";    
   
    if(tempArrBilling){

        if(tempArrBilling['Patient Details'].trim().toLowerCase().includes("patient seen")){

            for(val in arrDataToBePrintedBilling){

                if(typeof tempArrBilling[arrDataToBePrintedBilling[val]] !== "undefined"){
    
                    arrDataToBePrintedBillingVal = arrDataToBePrintedBilling[val];
                    varHeadingVal = "";
                    if(arrDataToBePrintedBillingVal != "Patient Details" && arrDataToBePrintedBillingVal != "final Description"){
                        varHeadingVal = arrDataToBePrintedBillingVal + ': ';
                    }
    
                    var finalString = finalString + varHeadingVal + tempArrBilling[arrDataToBePrintedBilling[val]] + '\n\n';
                }
                else{
                    var finalString = finalString + arrDataToBePrintedBilling[val] + ': \n\n';
                }
            }
            if(document.querySelector(".main-rich-text-editor-section #ta-report-billing").value == ''){
                document.querySelector(".main-rich-text-editor-section #ta-report-billing").value = finalString;
            }
            else{
                document.querySelector(".main-rich-text-editor-section #ta-report-billing").value += "\n\n****************** Next Report ******************\n\n" +finalString;
            }
            document.querySelector(".main-rich-text-editor-section ");

        }
    }
}

function uploadFileandCreateArray(uploadedCsvFile){
    const file = uploadedCsvFile;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        const data = event.target.result;
        const rows = data.split('\n');
        const dataArray = [];
        rows.forEach(row => {
            const columns = row.split(',');
            dataArray.push(columns);
        });
        window.csvData = dataArray;
    };
}

function extractDiagnosis() {
    var inputFileMedicalReport = document.getElementById("inputFileMedicalReport").files;
    document.querySelector("#ta-report").value = "";

    if(inputFileMedicalReport){
        dsm5Diagnoses = "";
        fetch('../original diagnosis/DSM Disgnostics with Shortforms.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const parsedData = rows.map(row => row.split(','));
            dsm5Diagnoses = parsedData;
        })
        .catch(error => console.error(error));

        for(reports in inputFileMedicalReport){
            readMedicalReport(inputFileMedicalReport[reports], dsm5Diagnoses);
        }
        
    }else{
      alert("Please select a medical report file.")
    }
}




function contentGenerator(arrDataToBeFetched, text, dsm5Diagnoses){

    var tempArr = [];
    var tempArrBilling = [];

    var array = ['apple', 'banana', 'cherry'];

    // var uppercaseArray = arrDataToBeFetched.map(function(value) {
    // return value.toUpperCase();
    // });

    var SplittedMultipleReports = text.split("*****");

    for(smr in SplittedMultipleReports){


        uppercaseArray = arrDataToBeFetched[smr];

        var startingWord = "";
        var borderWord = "";
        var currentIndex = "";
        var tempArr = [];
        var tempArrBilling = [];
        var pattern = new RegExp(`([\\s\\S]*?)(?=${uppercaseArray[0]})`);
        outputText = "";
        var outputText = pattern.exec(SplittedMultipleReports[smr]);
        var psychiatristName = "";
        // console.log(uppercaseArray[0], pattern.exec(SplittedMultipleReports[smr]), SplittedMultipleReports[smr]);
        tempArrBilling["Patient Details"] = pattern.exec(SplittedMultipleReports[smr])[1].trim();

        for( let i = 0 ; i < uppercaseArray.length ; i++ ){

            for( let i = 0 ; i < uppercaseArray.length ; i++ ){
                if(currentIndex == ""){
                    currentIndex =  text.indexOf(uppercaseArray[i]);
                    startingWord = uppercaseArray[i];
                }
            }
            var TempBorderIndex = "";
            for( let i = 0 ; i < uppercaseArray.length ; i++ ){
                if(text.indexOf(uppercaseArray[i]) > text.indexOf(startingWord) && TempBorderIndex ==""){
    
                    TempBorderIndex =  text.indexOf(uppercaseArray[i]);
                    borderWord = uppercaseArray[i]; 
                }
                else{
                    if((text.indexOf(uppercaseArray[i]) > text.indexOf(startingWord)) && (text.indexOf(uppercaseArray[i]) < TempBorderIndex) ){
                        TempBorderIndex =  text.indexOf(uppercaseArray[i]);
                        borderWord = uppercaseArray[i];
                    }
                }
            }
            // console.log("Border Value: ", borderWord);
            // console.log(startingWord, " <==> ", borderWord);

            if(i == uppercaseArray.length - 1){
                var pattern = new RegExp(`${startingWord}([\\s\\S]*)`);
                outputText = "";
                var outputText = pattern.exec(text);
                var psychiatristName = "";
            }
            else{
                var pattern = new RegExp(`${startingWord}:([\\s\\S]*?)(?=${borderWord}:)`);
                outputText = "";
                var outputText = pattern.exec(text);
                var psychiatristName = "";

                if(outputText == null){
                    var pattern = new RegExp(`${startingWord}:([\\s\\S]*?)(?=${borderWord})`);
                    outputText = "";
                    var outputText = pattern.exec(text);
                    var psychiatristName = "";
                }

                if(outputText == null){
                    var pattern = new RegExp(`${startingWord}([\\s\\S]*?)(?=${borderWord}:)`);
                    outputText = "";
                    var outputText = pattern.exec(text);
                    var psychiatristName = "";
                }

                if(outputText == null){
                    var pattern = new RegExp(`${startingWord}([\\s\\S]*?)(?=${borderWord})`);
                    outputText = "";
                    var outputText = pattern.exec(text);
                    var psychiatristName = "";
                }

                if(startingWord == borderWord){
                    var pattern = new RegExp(`${startingWord}([\\s\\S]*)`);
                    outputText = "";
                    var outputText = pattern.exec(text);
                    var psychiatristName = "";
                }

            }

            // console.log(startingWord);
            
            if(pattern.exec(SplittedMultipleReports[smr]) != null){
                switch(startingWord){

                    case 'NAME':
                        tempArr['Patient Name'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        tempArrBilling["Name"] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;
                    
                    case 'D.O.B':
                        tempArrBilling['D.O.B'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;

                    case 'GENDER':
                        tempArrBilling['Gender'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;

                    case 'MHSC':
                        tempArrBilling['MHSC'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;

                    case 'PHIN':
                        tempArrBilling['PHIN'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;

                    case 'DATE OF ASSESSMENT':
                        tempArr['Date of Appointment'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        tempArrBilling['Date of Assessment'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;
                    
                    case 'REFERRING PHYSICIAN':
                        tempArr['Referring Physician'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        tempArrBilling['Referring Physician'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;
                    
                    case 'PSYCHIATRIST':
                        tempArr['Psychiatrist'] = pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;
                    
                    case 'CLINIC':
                        tempArr['Clinic'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;
                    
                    case 'DATE OF REFERRAL':
                        tempArr['Date Of Referral'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        tempArrBilling['Date of Referral'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        break;
                    
                    case 'REASON FOR REFERRAL':
                        // Content from Resaon for Referral
                        break;
                    
                    case 'PSYCHIATRIC ASSESSMENT':

                        var nameRegex = /\((.*?)\)/g;  // regular expression to match all text inside brackets
                        var matches1 = pattern.exec(SplittedMultipleReports[smr])[1].trim().match(nameRegex);  // execute the regex on the string
                        var names = [];
                        if (matches1) {
                            var names = matches1.map(match => match.substring(1, match.length - 1));  // extract the names from each match
                        }
                        for(drName in names){
                            (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes(`resident(${names[drName].trim().toLowerCase().replace(/ /g, "")})attendedsession`)) ? tempArr['Psychiatry Resident (PM)'] =  names[drName] : "";
                            (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes(`medical(${names[drName].trim().toLowerCase().replace(/ /g, "")})studentattendedvisit`)) ? tempArr['Elective Student (PM)'] =  names[drName] : "";
                            (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes(`sharedcarecounsellor(${names[drName].trim().toLowerCase().replace(/ /g, "")})attendedvisit`)) ? tempArr['SCC'] =  names[drName] : "";
                        }
                        (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes("patientseenforfollowup")) ? tempArr['Type of Appt'] = "followup": "";
                        (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes("patientseenforconsult")) ? tempArr['Type of Appt'] = "consult": "";
                        (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes("patientseenforassessment")) ? tempArr['Type of Appt'] = "assessment": ""; 

                        tempArr['Patient Attended'] = pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("patient seen") ? "Yes" : "No";
                        tempArr['Spoke to PCP (before visit/after visit)'] = pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("before/after") ? "Yes" : "No";

                        if(pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("family doctor before/after appointment")){
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Discussed before and after both";
                        }
                        else if(pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("family doctor before appointment")){
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Discussed before";
                        }
                        else if(pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("family doctor after appointment")){
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Discussed after";
                        }
                        else{
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Not Discussed";
                        }

                        break;

                    case 'SHARED CARE PSYCHIATRY FOLLOWUP':

                        var nameRegex = /\((.*?)\)/g;  // regular expression to match all text inside brackets
                        var matches1 = pattern.exec(SplittedMultipleReports[smr])[1].trim().match(nameRegex);  // execute the regex on the string
                        var names = [];
                        if (matches1) {
                            var names = matches1.map(match => match.substring(1, match.length - 1));  // extract the names from each match
                        }
                        for(drName in names){
                            (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes(`resident(${names[drName].trim().toLowerCase().replace(/ /g, "")})attendedsession`)) ? tempArr['Psychiatry Resident (PM)'] =  names[drName] : "";
                            (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes(`medical(${names[drName].trim().toLowerCase().replace(/ /g, "")})studentattendedvisit`)) ? tempArr['Elective Student (PM)'] =  names[drName] : "";
                            (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes(`sharedcarecounsellor(${names[drName].trim().toLowerCase().replace(/ /g, "")})attendedvisit`)) ? tempArr['SCC'] =  names[drName] : "";
                        }
                        (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes("patientseenforfollowup")) ? tempArr['Type of Appt'] = "followup": "";
                        (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes("patientseenforconsult")) ? tempArr['Type of Appt'] = "consult": "";
                        (pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().replace(/ /g, "").includes("patientseenforassessment")) ? tempArr['Type of Appt'] = "assessment": ""; 

                        tempArr['Patient Attended'] = pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("patient seen") ? "Yes" : "No";
                        tempArr['Spoke to PCP (before visit/after visit)'] = pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("before/after") ? "Yes" : "No";

                        if(pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("family doctor before/after appointment")){
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Discussed before and after both";
                        }
                        else if(pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("family doctor before appointment")){
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Discussed before";
                        }
                        else if(pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("family doctor after appointment")){
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Discussed after";
                        }
                        else{
                            tempArr['Spoke to PCP (before visit/after visit)'] = "Not Discussed";
                        }

                        break;
                    
                    case 'IMPRESSION':

                    console.log("Is There an Addictions Component");
                        
                        tempArrBilling['final Description'] =  pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        var pdlImpressions = "";
                        var counter = 1;

                        // dsm5Diagnoses
                        // var text = dsm5Diagnoses;
                        // dsm5Diagnoses = text.split("\n");
                        // dsm5Diagnoses.shift();
                        // for (let i = 0; i < dsm5Diagnoses.length; i++) {
                        //     dsm5Diagnoses[i] = dsm5Diagnoses[i].replace(/\r/g, "");
                        // }

                        var dsm5DiagnosesReg = [];
                        var mainDiagnosisHeader = [];
                        for(let value in dsm5Diagnoses){
                            /* eleminate the blank data and get the last column data of row */
                            var totLen = dsm5Diagnoses[value].length;
                            var strToMatch = "";
                            var strToMatchShortCodes = "";

                            for( let i = totLen ; i > -1 ; i--  ){
                                if(typeof dsm5Diagnoses[value][i] !== "undefined" && dsm5Diagnoses[value][i] != null && dsm5Diagnoses[value][i].trim() != ""){
                                    // strToMatch = dsm5Diagnoses[value][i].toLowerCase();
                                    // strToMatchShortCodes = dsm5Diagnoses[value][0].toLowerCase();

                                    // console.log(dsm5Diagnoses[value][i], i);

                                    dsm5DiagnosesReg[value] = dsm5Diagnoses[value][i].replace(/\r/g, "");
                                    mainDiagnosisHeader[dsm5Diagnoses[value][i].replace(/\r/g, "")] = dsm5Diagnoses[value][1];

                                    break;
                                }
                            }
                        }
                        dsm5Regex = new RegExp(dsm5DiagnosesReg.join("|"), "i");
                        var impression = pattern.exec(SplittedMultipleReports[smr])[1].trim();
                        var diagnosis = impression.match(dsm5Regex);
                        if(diagnosis != null){
                            diagnosis = diagnosis.filter(function( element ) {
                                return element !== undefined;
                            });

                            var primaryLegendArr = [
                                "Anxiety Disorders",
                                "Depression",
                                "Bipolar Disorder",
                                "Other Mood Disorder",
                                "Personality Disorder",
                                "Psychotic Disorder",
                                "Other, specify"
                            ];

                            if(primaryLegendArr.includes(mainDiagnosisHeader[diagnosis])){
                                tempArr['Primary Diagnosis'] = primaryLegendArr.indexOf(mainDiagnosisHeader[diagnosis]) + 1;
                            }
                            else{
                                tempArr['Primary Diagnosis'] = "7";
                            }

                            var pdlImpressions = "";
                            var counter = 1;
                            tempArr['Is There an Addictions Component'] = "No";
                            var firstColumn = dsm5Diagnoses.map(row => row[0]).filter(value => value !== null && value !== '');
                            for (let i = 0; i < firstColumn.length; i++) {
                                const value = firstColumn[i];
                                if (pattern.exec(SplittedMultipleReports[smr])[1].toLowerCase().indexOf(value) !== -1) {
                                    tempArr['Is There an Addictions Component'] = "Yes";
                                    break;
                                }
                            }
                            
                            for(let value in dsm5Diagnoses){
                                var totLen = dsm5Diagnoses[value].length;
                                var strToMatch = "";

                                for( let i = totLen ; i > -1 ; i--  ){
                                    if(typeof dsm5Diagnoses[value][i] !== "undefined" && dsm5Diagnoses[value][i] != null && dsm5Diagnoses[value][i].trim() != ""){
                                        strToMatch = dsm5Diagnoses[value][i].toLowerCase();
                                        strToMatchShortCodes = dsm5Diagnoses[value][0].toLowerCase();
                                        break;
                                    }
                                }
                                outputText[1] = pattern.exec(SplittedMultipleReports[smr])[1].toLowerCase();

                                if(outputText[1].includes(strToMatch.trim()) && strToMatch.trim() != ""){
                                    var finalStr = "";
                                    for( let i = 1 ; i < totLen ; i++  ){
                                        (dsm5Diagnoses[value][i].trim() != "") ? (finalStr != "" ) ? finalStr = finalStr + ' :: ' + dsm5Diagnoses[value][i] : finalStr = dsm5Diagnoses[value][i] : "" ;
                                        if(dsm5Diagnoses[value][i] == "Substance-Related and Addictive Disorders"){
                                            tempArr['Is There an Addictions Component'] = "Yes";
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    
                    case 'RECOMMENDATIONS':

                        tempArr['Followup Required'] = pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("patient for followup") ? "Yes" : "No";
                        tempArr['Referred To Share Care Counsellor'] = pattern.exec(SplittedMultipleReports[smr])[1].includes("can be referred to Shared Care Counsellor") ? "Yes" : "No";
                        tempArr['Specialist Referral Required'] = pattern.exec(SplittedMultipleReports[smr])[1].trim().toLowerCase().includes("can be referred for specialist") ? "Yes" : "No";
                        
                        // const str = pattern.exec(SplittedMultipleReports[smr])[1];
                        // const regex = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)+(?:,\s(?:[A-Z]+(?:,\s)?)+)+$/gm;
                        // const matches = [...str.matchAll(regex)];
                        // var opt = "";
                        // matches.forEach(match => {
                        // tempArr['Psychiatrist'] = match[0];
                        // });

                        const regex = /([A-Za-z\s]+,\s*(?:MD|PhD|DO|FRCPC|FRCP|FRCPSC)(?:,\s*(?:MD|PhD|DO|FRCPC|FRCP|FRCPSC))*)/;
                        const match = pattern.exec(SplittedMultipleReports[smr])[1].match(regex);

                        if (match && match[1]) {
                        const nameWithDegrees = match[1].trim();
                        tempArr['Psychiatrist'] = nameWithDegrees;
                        } else {
                        console.log("Name with degrees not found.");
                        }

                        break;

                    default: 
                        // console.log("default case executed !!");
                        // this case will be executed when none of the case is executed!!  
                }
            }

            startingWord = borderWord;
            
        }

        createContent(tempArr, tempArrBilling);
    }
}

function extractWordsWithCapitalCharacters(text) {

    window.arrayData = [];
    var arrHtmlSplitted = document.querySelector("#TempId").innerText.split("*****");

    for (var val in arrHtmlSplitted) {
    var lines = arrHtmlSplitted[val].split("\n");
    var extractedSentences = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var firstWord = line.split(/:\s*|\s+/)[0];
        var cleanedFirstWord = firstWord.replace(/[^A-Za-z\s.]/g, "");

        if (cleanedFirstWord === "D.O.B") {
        extractedSentences.push(cleanedFirstWord);
        } else if (/^[A-Z][A-Z\s]*$/.test(firstWord)) {
        var match = line.match(/[A-Z][A-Z\s]+(?![a-z])/g);

        if (match) {
            extractedSentences.push(match.join(" "));
        }
        }
    }
    window.arrayData[val] = extractedSentences;
}
    console.log("*******************************************", window.arrayData, "*******************************************");

}

function readMedicalReport(currentFile, dsm5Diagnoses) {
    
    document.querySelector("#spin-loader").classList.add("loading");

    if(currentFile.type == 'text/plain'){
        var dsm5Diagnoses = dsm5Diagnoses || [];
        var dsm5Regex;
        var arrDiagnosis = [];
        var inputFileMedicalReport = currentFile;
        var readerMedicalReport = new FileReader();
        readerMedicalReport.onload = function() {
        var text = readerMedicalReport.result;
        contentGenerator(arrDataToBeFetched, text, dsm5Diagnoses);
      }
      readerMedicalReport.readAsText(inputFileMedicalReport);
    }
    else if(currentFile.type === 'application/msword' || currentFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
        window.dsm5Diagnoses == dsm5Diagnoses || [];
        var file = currentFile;
        var text = "";
        


        mammoth.convertToHtml({ arrayBuffer: file })
        .then(function (res) {

            document.querySelector("#TempId").innerHTML = res.value;

            extractWordsWithCapitalCharacters(res.value);

            mammoth.extractRawText({arrayBuffer: file})
            .then(function(result) {
                text = result.value;
                var dsm5Diagnoses = window.dsm5Diagnoses || [];
                var dsm5Regex;
                var arrDiagnosis = [];
                var inputFileMedicalReport = currentFile;
                var tempArr = [];
                // contentGenerator(arrDataToBeFetched, text, dsm5Diagnoses);
                contentGenerator(window.arrayData, text, dsm5Diagnoses);

                // console.log("contentGenerator", window.arrayData);

            })
            .done(function(){
                document.querySelector("#spin-loader").classList.remove("loading");
            });


      

        })
        .catch(function (error) {
          console.error("Error converting file to HTML:", error);
        });




    }
}

function showAlertandClickFile(){
    alert("Please Select a Diagnosis Report first");
}

function genarateAndExportFormat (){
    document.querySelectorAll('input[type=radio][name="radio-txt-pdf"]').forEach(el => {
        el.addEventListener("change", function(event){
            document.querySelector(".export-format-btn #dynamic-format-name").innerHTML = '.' + this.value;
        }, true);
    })

    document.querySelector('.export-format-btn #ExportFormat').addEventListener("click", function(event){
        var ext = document.querySelector('input[type=radio][name="radio-txt-pdf"]:checked').value;

        var cont = document.querySelector(".rich-text-editor #ta-report").value;
        if(cont.trim() != ""){
            downloadToFile(cont,'statistics.' + ext , (ext == 'txt') ? 'text/plain' : 'application/pdf', ext );
        }
        
        var contBilling = document.querySelector(".rich-text-editor #ta-report-billing").value;
        if(contBilling.trim() != ""){
            downloadToFile(contBilling,'Billing.' + ext , (ext == 'txt') ? 'text/plain' : 'application/pdf', ext );
        }

    }, true);

    document.querySelector("#extract-diagnosis").addEventListener("click", function(){
        if(document.getElementById('inputFileMedicalReport').files.length === 0){
            alert("Please select a file first");
            document.getElementById('inputFileMedicalReport').click();
        }
        else{
            document.querySelector("#ta-report").value="";
            document.querySelector("#ta-report-billing").value="";
            extractDiagnosis();
        }
    }, true)

}   
genarateAndExportFormat();

