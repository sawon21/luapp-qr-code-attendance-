// List of students with their details (id, name, roll, department).
const students = [
    { id: "✔LUAPP~20240101", name: "Mehedi", roll: "101", department: "Science", phone:"+8801315159509" },
    { id: "20240242", name: "Abid", roll: "102", department: "Arts", phone:"+8801315159509" },
    { id: "20240243", name: "Sawon", roll: "103", department: "Commerce", phone:"+8801315159509"}
];

// Load any previously saved attendance from Local Storage.
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];

// Ensure DOM is fully loaded before running the code.
function domReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

// Execute code after DOM is ready.
domReady(function () {
    // Load the saved attendance records into the table.
    loadAttendance();

    // Called when a QR code is successfully scanned.
    function onScanSuccess(decodeText) {
        const student = students.find(s => s.id === decodeText);
        
        if (student) {
            // Check if the student is already marked present.
            if (!isStudentAlreadyPresent(student.id)) {
                const currentTime = new Date().toLocaleTimeString();
                attendance.push({ ...student, time: currentTime });
                localStorage.setItem('attendance', JSON.stringify(attendance));
                addAttendanceToTable(student, currentTime);
                showModal(`Verified: ${student.name} ✅`, "verified");
                textToSpeech(`Welcome, ${student.name}`);
            } else {
                // Show the same modal for already marked students

            }
        } else {
            showModal("Not Found: Invalid ID ❌", "danger");
            textToSpeech("Invalid ID scanned.");
        }
    }

    // Function to show a modal for 2 seconds and play sound based on the type.
    function showModal(message, type) {
        const modalBody = document.getElementById("modal-body-text");
        modalBody.innerHTML = message;

        // Set modal style based on the type (success, info, danger).
        const modalDialog = document.querySelector('.modal-dialog');
        modalDialog.className = `modal-dialog modal-${type}`;

        // Play the corresponding sound
        const sound = document.getElementById(`${type}-sound`);
        if (sound) {
            sound.currentTime = 0; // Reset sound to the beginning
            sound.play();
        }

        // Show modal and automatically hide it after 2 seconds.
        $('#resultModal').modal('show');
        setTimeout(() => $('#resultModal').modal('hide'), 4000);
    }

    // Function to check if a student is already marked present.
    function isStudentAlreadyPresent(id) {
        return attendance.some(entry => entry.id === id);
    }

    // Text-to-speech functionality
    function textToSpeech(message) {
        const speech = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(speech);
    }

    // Initialize the QR code scanner.
    let htmlscanner = new Html5QrcodeScanner("my-qr-reader", { fps: 10, qrbox: 350 });
    htmlscanner.render(onScanSuccess);





// Button to download attendance records as PDF.
document.getElementById("download-pdf").onclick = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get the current date and format it correctly.
    const currentDate = new Date().toLocaleDateString();

    // Set font styles for the header.
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);  // Set header text color (blue)
    doc.text("Logic University", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);  // Reset to black for subtitle
    doc.text("Medical & Nursing Admission Private Program", 105, 30, null, null, "center");
    
    doc.setFontSize(12);
    doc.text("Developed by - Mehedi Al Hasan Sawon", 105, 40, null, null, "center");

    // Date information
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 10, 50);

    // Generate the filename for the PDF
    const fileName = `${currentDate}-Science-present-students.pdf`;

    // Style the table header with a background color
    doc.setFillColor(204, 229, 255);  // Light blue background
    doc.rect(10, 60, 190, 10, 'F');  // Draw filled rectangle for the header background

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 102);  // Dark blue for header text
    doc.text("Serial No.", 15, 65);
    doc.text("Name", 35, 65);
    doc.text("Roll", 80, 65);
    doc.text("Department", 120, 65);
    doc.text("Time", 170, 65);

    // Set alternating row colors and print the data in a book-style table format.
    let y = 75;
    const pageHeight = 280;  // Page height limit for A4 paper in jsPDF
    const rowHeight = 10;
    let rowColorFlag = false;  // To alternate row colors

    attendance.forEach((entry, index) => {
        if (y > pageHeight - 20) {
            doc.addPage();  // Add a new page if the current one is filled
            y = 20;  // Reset Y position for the new page
            
            // Repeat the table headers on each new page.
            doc.setFillColor(204, 229, 255);  
            doc.rect(10, y, 190, rowHeight, 'F'); 
            doc.setTextColor(0, 0, 102);
            doc.text("Serial No.", 15, y + 5);
            doc.text("Name", 35, y + 5);
            doc.text("Roll", 80, y + 5);
            doc.text("Department", 120, y + 5);
            doc.text("Time", 170, y + 5);
            y += rowHeight + 5;  // Space after header
        }

        // Alternate row background color
        doc.setFillColor(rowColorFlag ? 255 : 240, 240, 240);  // Light grey
        doc.rect(10, y, 190, rowHeight, 'F');

        // Draw data rows with alternating colors
        doc.setTextColor(0, 0, 0);  // Reset to black for row text
        doc.text((index + 1).toString(), 15, y + 5);
        doc.text(entry.name, 35, y + 5);
        doc.text(entry.roll, 80, y + 5);
        doc.text(entry.department, 120, y + 5);
        doc.text(entry.time, 170, y + 5);
        
        // Move to next row
        y += rowHeight;
        rowColorFlag = !rowColorFlag;  // Toggle row color
    });

    // Add footer for absent students.
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Generated by Student Attendance App - Mehedi Al Hasan Sawon", 100, y + 20, null, null, "center");

    // Save the PDF with the formatted filename.
    doc.save(fileName);
};




    // Function to load saved attendance into the table.
    function loadAttendance() {
        const attendanceBody = document.getElementById("attendance-body");
        attendanceBody.innerHTML = ""; // Clear existing entries

        attendance.forEach((entry, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.roll}</td>
                <td>${entry.department}</td>
                <td>${entry.time}</td>
            `;
            attendanceBody.appendChild(row);
        });
    }

    // Function to add a student entry to the attendance table.
    function addAttendanceToTable(student, time) {
        const attendanceBody = document.getElementById("attendance-body");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${attendance.length + 1}</td>
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.department}</td>
            <td>${time}</td>
        `;
        attendanceBody.appendChild(row);
    }
});








// Button to download absent students as a PDF.
document.getElementById("download-absent-pdf").onclick = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    const currentDate = new Date().toLocaleDateString();
    const fileName = `${currentDate}-Science-absent-students.pdf`;

    // Add headers with style and colors.
    doc.setFontSize(20);
    doc.setTextColor(30, 144, 255); // Blue header
    doc.text("Logic University", 300, 40, null, null, "center");

    doc.setFontSize(14);
    doc.setTextColor(0, 128, 0); // Green subheader
    doc.text("Medical & Nursing Admission Private Program", 300, 60, null, null, "center");

    doc.setFontSize(12);
    doc.setTextColor(128, 0, 128); // Purple footer
    doc.text("Developed by - Mehedi Al Hasan Sawon", 300, 80, null, null, "center");

    doc.setFontSize(10);
    doc.setTextColor(0); // Black date text
    doc.text(`Date: ${currentDate}`, 50, 100);

    // Table headers for absent students with stylish background
    const startY = 120;
    doc.setFontSize(10);
    doc.setFillColor(220, 220, 220); // Light gray header background
    doc.rect(40, startY, 500, 20, 'F'); // Header background box
    doc.text("Serial No.", 50, startY + 15);
    doc.text("Name", 100, startY + 15);
    doc.text("Roll", 200, startY + 15);
    doc.text("Department", 300, startY + 15);
    doc.text("Phone Number ", 400, startY + 15);

    // Find absent students and add their details
    let y = startY + 40;
    const rowHeight = 20;
    const absentStudents = students.filter(student => !isStudentAlreadyPresent(student.id));

    if (absentStudents.length === 0) {
        doc.text("All students are present.", 50, y);
    } else {
        absentStudents.forEach((student, index) => {
            doc.setFontSize(10);
            doc.setFillColor(index % 2 === 0 ? 255 : 245, 245, 245); // Alternating row colors
            doc.rect(40, y - 10, 500, rowHeight, 'F'); // Row background box

            doc.text((index + 1).toString(), 50, y);
            doc.text(student.name, 100, y);
            doc.text(student.roll, 200, y);
            doc.text(student.department, 300, y);
            doc.text(student.phone, 400, y);

            y += rowHeight +5;

            if (y > 750) { // Add new page when space is exceeded
                doc.addPage();
                y = 50; // Reset y position for new page
            }
        });
    }

    // Add footer for absent students.
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Generated by Student Attendance App - Mehedi Al Hasan Sawon ", 300, y + 20, null, null, "center");

    // Save the PDF with the formatted filename.
    doc.save(fileName);
};
// Function to check if a student is already marked present.
function isStudentAlreadyPresent(id) {
    return attendance.some(entry => entry.id === id);
}