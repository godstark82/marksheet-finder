import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

// Replace with your Google Sheet ID
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const RANGE = 'Sheet1'; // Use just the sheet name instead of a specific range

// Service Account credentials
const CREDENTIALS = {
  type: process.env.GOOGLE_TYPE || "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID || "shopping-next-febdd",
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "",
  private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL || "serviceaccountformarksheetfind@shopping-next-febdd.iam.gserviceaccount.com",
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CERT_URL || "",
  universe_domain: "googleapis.com"
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get search parameters
  const rollNumber = searchParams.get('rollNumber');
  const name = searchParams.get('name');
  const course = searchParams.get('course');

  // Check if at least one search parameter is provided
  if (!rollNumber && !name && !course) {
    return NextResponse.json(
      { error: 'At least one search parameter (rollNumber, name, or course) is required' },
      { status: 400 }
    );
  }

  try {
    // Auth with service account
    const client = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    await client.authorize();

    // Initialize the Sheets API with the authenticated client
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Get the data from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    
    // Skip the header row and map column indices
    if (rows.length <= 1) {
      return NextResponse.json(
        { error: 'No student data found' },
        { status: 404 }
      );
    }
    
    // Get column indices from header row
    const headerRow = rows[0];
    const nameIndex = headerRow.findIndex(col => col.toLowerCase().includes('name'));
    const rollNoIndex = headerRow.findIndex(col => col.toLowerCase().includes('rollno') || col.toLowerCase().includes('roll no'));
    const addressIndex = headerRow.findIndex(col => col.toLowerCase().includes('address'));
    const marksheetIndex = headerRow.findIndex(col => col.toLowerCase().includes('marksheet'));
    const notesIndex = headerRow.findIndex(col => col.toLowerCase().includes('notes'));
    const courseIndex = headerRow.findIndex(col => col.toLowerCase().includes('course'));
    
    // Handle different search types
    if (rollNumber || name) {
      // Find a single student by roll number or name
      let studentRow;
      if (rollNumber) {
        studentRow = rows.slice(1).find((row) => 
          row[rollNoIndex]?.toString().trim().toLowerCase() === rollNumber.trim().toLowerCase()
        );
      } else if (name) {
        studentRow = rows.slice(1).find((row) => 
          row[nameIndex]?.toString().trim().toLowerCase() === name.trim().toLowerCase()
        );
      }

      if (!studentRow) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      // Get student data
      const studentName = nameIndex >= 0 ? studentRow[nameIndex] || '' : '';
      const studentRollNumber = rollNoIndex >= 0 ? studentRow[rollNoIndex] || '' : '';
      const marksheetStatus = marksheetIndex >= 0 ? studentRow[marksheetIndex] || '' : '';
      const studentAddress = addressIndex >= 0 ? studentRow[addressIndex] || '' : '';
      const studentNotes = notesIndex >= 0 ? studentRow[notesIndex] || '' : '';
      const studentCourse = courseIndex >= 0 ? studentRow[courseIndex] || '' : '';

      // Check if marksheet is available
      const isAvailable = 
        ['yes', 'true', '1', 'available', 'y'].includes(
          marksheetStatus.toString().trim().toLowerCase()
        );

      return NextResponse.json({
        available: isAvailable,
        name: studentName,
        rollNumber: studentRollNumber,
        address: studentAddress,
        notes: studentNotes,
        course: studentCourse,
        multipleResults: false
      });
    } 
    else if (course && courseIndex >= 0) {
      // For course search, return all students in the course whose marksheets are available
      const matchingStudents = rows.slice(1).filter((row) => {
        // Check if this student is in the requested course
        const studentCourse = row[courseIndex]?.toString().trim().toLowerCase() || '';
        const courseMatch = studentCourse.includes(course.trim().toLowerCase());
        
        // Return this student if they're in the course
        return courseMatch;
      }).map(row => {
        const studentName = nameIndex >= 0 ? row[nameIndex] || '' : '';
        const studentRollNumber = rollNoIndex >= 0 ? row[rollNoIndex] || '' : '';
        const marksheetStatus = marksheetIndex >= 0 ? row[marksheetIndex] || '' : '';
        const isAvailable = ['yes', 'true', '1', 'available', 'y'].includes(
          marksheetStatus.toString().trim().toLowerCase()
        );
        
        return {
          name: studentName,
          rollNumber: studentRollNumber,
          available: isAvailable
        };
      });

      if (matchingStudents.length === 0) {
        return NextResponse.json(
          { error: 'No students found for this course' },
          { status: 404 }
        );
      }

      // Return the list of students with their marksheet status
      return NextResponse.json({
        course: course,
        multipleResults: true,
        students: matchingStudents
      });
    }

    // This code should never be reached
    return NextResponse.json(
      { error: 'Invalid search parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to check marksheet availability' },
      { status: 500 }
    );
  }
} 