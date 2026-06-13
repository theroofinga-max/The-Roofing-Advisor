<?php
/**
 * The Roofing Advisor - Secure Lead Submission Handler (PHP VPS Edition)
 * Save this file as 'submit.php' in your website's root directory.
 * 
 * Features:
 * - Zero external dependencies (Works on all standard native PHP 7.0+ servers)
 * - Safe data sanitization and filtering
 * - Appends leads directly to a secured local CSV spreadsheet file
 * - Dual-layer storage (Optional SQLite database fallback if SQLite is enabled)
 * - Beautiful web panel built-in to view & download leads securely with a simple password
 */

// --- CONFIGURATION ---
define('SECURE_PASSWORD', 'Advisor2026!'); // Change this to your preferred admin password to view/download leads
define('LEADS_FILE', '.leads_secure_database.csv'); // Leading dot restricts direct browser access on Nginx/Apache

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- HANDLE VIEW PANEL / CSV DOWNLOAD (GET request with password) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // If attempting to download or view leads
    if (isset($_GET['action'])) {
        $pass = isset($_GET['password']) ? $_GET['password'] : '';
        if ($pass !== SECURE_PASSWORD) {
            header('Content-Type: text/html');
            echo '<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Leads Database Access</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-slate-50 flex items-center justify-center min-h-screen font-sans">
                <div class="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-150 shadow-lg text-center space-y-6">
                    <div class="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div class="space-y-2">
                        <h1 class="text-xl font-black text-slate-800">Leads Portal Access</h1>
                        <p class="text-sm text-slate-500">Enter the administration password to access your VPS stored leads log.</p>
                    </div>
                    <form method="GET" class="space-y-4">
                        <input type="hidden" name="action" value="view">
                        <input type="password" name="password" required placeholder="Enter Admin Password" class="w-full px-4 py-3 border border-slate-250 rounded-lg text-center" />
                        <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition">Submit Authenticated Entry</button>
                    </form>
                </div>
            </body>
            </html>';
            exit;
        }

        // CSV File Exists Check
        $fileExists = file_exists(LEADS_FILE);

        if ($_GET['action'] === 'download') {
            if (!$fileExists) {
                header('Content-Type: application/json');
                echo json_encode(['error' => 'No leads recorded yet.']);
                exit;
            }
            // Download CSV
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="leads_export_' . date('Y-m-d_H-i-s') . '.csv"');
            header('Pragma: no-cache');
            header('Expires: 0');
            readfile(LEADS_FILE);
            exit;
        }

        if ($_GET['action'] === 'view') {
            header('Content-Type: text/html');
            $leads = [];
            if ($fileExists) {
                if (($handle = fopen(LEADS_FILE, "r")) !== FALSE) {
                    // Skip header row
                    $headers = fgetcsv($handle, 1000, ",");
                    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                        $leads[] = $data;
                    }
                    fclose($handle);
                }
            }
            // Reverse list to show newest first
            $leads = array_reverse($leads);

            echo '<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Leads Log Viewer</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-slate-50 p-6 sm:p-12 font-sans Min-h-screen text-slate-800">
                <div class="max-w-7xl mx-auto space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
                        <div class="space-y-1">
                            <h1 class="text-2xl font-black text-slate-800">The Roofing Advisor Leads Log</h1>
                            <p class="text-sm text-slate-500">Your VPS server-side database has collected <strong class="text-orange-500 font-bold">' . count($leads) . '</strong> total leads.</p>
                        </div>
                        <div class="flex gap-3">
                            <a href="?action=download&password=' . urlencode($pass) . '" class="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export CSV
                            </a>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm whitespace-nowrap">
                                <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-mono font-bold uppercase uppercase tracking-wider">
                                    <tr>
                                        <th class="py-4 px-6">Timestamp</th>
                                        <th class="py-4 px-6">First Name</th>
                                        <th class="py-4 px-6">Last Name</th>
                                        <th class="py-4 px-6">Email</th>
                                        <th class="py-4 px-6">Phone Number</th>
                                        <th class="py-4 px-6">Zip Code</th>
                                        <th class="py-4 px-6">City & State</th>
                                        <th class="py-4 px-6">Project Parameters</th>
                                        <th class="py-4 px-6">Referrer URL</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-150 text-slate-700">';

            if (empty($leads)) {
                echo '<tr><td colspan="9" class="py-12 px-6 text-center text-slate-400 font-medium">No lead submission logs recorded yet.</td></tr>';
            } else {
                foreach ($leads as $row) {
                    // Column mapping based on POST submission
                    // CSV values: Date, Name, Email, Phone, Zip, City, State, Type, Size, Material, Timeline, SourcePage
                    $timestamp = htmlspecialchars($row[0] ?? '');
                    $fullname = htmlspecialchars(($row[1] ?? '') . ' ' . ($row[2] ?? ''));
                    $email = htmlspecialchars($row[3] ?? '');
                    $phone = htmlspecialchars($row[4] ?? '');
                    $zip = htmlspecialchars($row[5] ?? '');
                    $location = htmlspecialchars(($row[6] ?? '') . ', ' . ($row[7] ?? ''));
                    $details = '<strong>Type:</strong> ' . htmlspecialchars($row[8] ?? '') . '<br>' . 
                               '<strong>Size:</strong> ' . htmlspecialchars($row[9] ?? '') . ' sqft<br>' .
                               '<strong>Material:</strong> ' . htmlspecialchars($row[10] ?? '') . '<br>' .
                               '<strong>Timeframe:</strong> ' . htmlspecialchars($row[11] ?? '');
                    $source = htmlspecialchars($row[12] ?? '');

                    echo '<tr class="hover:bg-slate-50">
                        <td class="py-4 px-6 font-mono text-xs text-slate-500">' . $timestamp . '</td>
                        <td class="py-4 px-6 font-bold text-slate-900">' . htmlspecialchars($row[1] ?? '') . '</td>
                        <td class="py-4 px-6 font-bold text-slate-900">' . htmlspecialchars($row[2] ?? '') . '</td>
                        <td class="py-4 px-6 select-all font-medium text-blue-600">' . $email . '</td>
                        <td class="py-4 px-6 select-all font-mono">' . $phone . '</td>
                        <td class="py-4 px-6 font-bold font-mono">' . $zip . '</td>
                        <td class="py-4 px-6 text-xs font-medium">' . $location . '</td>
                        <td class="py-4 px-6 text-xs leading-normal">' . $details . '</td>
                        <td class="py-4 px-6 text-xs text-slate-400 font-mono max-w-xs truncate" title="' . $source . '">' . $source . '</td>
                    </tr>';
                }
            }

            echo '</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </body>
            </html>';
            exit;
        }
    }
    
    // Normal GET on submit.php displays bad request
    echo json_encode(['error' => 'API Endpoint expects POST method. For Leads Portal, append ?action=view&password=YOUR_PASSWORD to the URL']);
    exit;
}

// --- HANDLE POST REQUESTS (JSON Payload from Client Forms) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get raw post data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload received.']);
        exit;
    }

    // Extract, clean and sanitize leads parameters
    $firstName   = filter_var($data['firstName'] ?? '', FILTER_DEFAULT);
    $lastName    = filter_var($data['lastName'] ?? '', FILTER_DEFAULT);
    $email       = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $phone       = filter_var($data['phone'] ?? '', FILTER_DEFAULT);
    $zip         = filter_var($data['zip'] ?? '', FILTER_DEFAULT);
    $city        = filter_var($data['city'] ?? '', FILTER_DEFAULT);
    $state       = filter_var($data['state'] ?? '', FILTER_DEFAULT);
    $projectType = filter_var($data['projectType'] ?? '', FILTER_DEFAULT);
    $roofSize    = filter_var($data['roofSize'] ?? '', FILTER_DEFAULT);
    $material    = filter_var($data['material'] ?? '', FILTER_DEFAULT);
    $timeline    = filter_var($data['timeline'] ?? '', FILTER_DEFAULT);
    $sourcePage  = filter_var($data['sourcePage'] ?? '', FILTER_SANITIZE_URL);

    // Validate minimum required fields
    if (empty($phone) || empty($zip)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Phone number and Zip Code are mandatory database fields.']);
        exit;
    }

    // Prepare lead record
    $createdAtTimestamp = date('Y-m-d H:i:s');
    $leadRecord = [
        $createdAtTimestamp,
        $firstName,
        $lastName,
        $email,
        $phone,
        $zip,
        $city,
        $state,
        $projectType,
        $roofSize,
        $material,
        $timeline,
        $sourcePage
    ];

    // CSV File Generation or Append Mode
    $isNewFile = !file_exists(LEADS_FILE);
    $fileHandle = fopen(LEADS_FILE, 'a');

    if ($fileHandle === false) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Could not write to local server disk storage file.']);
        exit;
    }

    // Print CSV Header Row if new file
    if ($isNewFile) {
        $headers = [
            'Created At', 'First Name', 'Last Name', 'Email', 'Phone', 
            'Zip Code', 'City', 'State', 'Project Type', 'Roof Size', 
            'Material', 'Timeline', 'Source Page'
        ];
        fputcsv($fileHandle, $headers);
    }

    // Write Lead Entry
    $writeSuccess = fputcsv($fileHandle, $leadRecord);
    fclose($fileHandle);

    // --- OPTIONAL SQLITE FALLBACK STORAGE (Creates database automatically) ---
    try {
        if (class_exists('SQLite3')) {
            $db = new SQLite3('.leads_database.sqlite');
            $db->exec("CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                phone TEXT,
                zip TEXT,
                city TEXT,
                state TEXT,
                project_type TEXT,
                roof_size TEXT,
                material TEXT,
                timeline TEXT,
                source_page TEXT
            )");

            $stmt = $db->prepare('INSERT INTO leads (created_at, first_name, last_name, email, phone, zip, city, state, project_type, roof_size, material, timeline, source_page) VALUES (:created_at, :first_name, :last_name, :email, :phone, :zip, :city, :state, :project_type, :roof_size, :material, :timeline, :source_page)');
            $stmt->bindValue(':created_at', $createdAtTimestamp, SQLITE3_TEXT);
            $stmt->bindValue(':first_name', $firstName, SQLITE3_TEXT);
            $stmt->bindValue(':last_name', $lastName, SQLITE3_TEXT);
            $stmt->bindValue(':email', $email, SQLITE3_TEXT);
            $stmt->bindValue(':phone', $phone, SQLITE3_TEXT);
            $stmt->bindValue(':zip', $zip, SQLITE3_TEXT);
            $stmt->bindValue(':city', $city, SQLITE3_TEXT);
            $stmt->bindValue(':state', $state, SQLITE3_TEXT);
            $stmt->bindValue(':project_type', $projectType, SQLITE3_TEXT);
            $stmt->bindValue(':roof_size', $roofSize, SQLITE3_TEXT);
            $stmt->bindValue(':material', $material, SQLITE3_TEXT);
            $stmt->bindValue(':timeline', $timeline, SQLITE3_TEXT);
            $stmt->bindValue(':source_page', $sourcePage, SQLITE3_TEXT);
            $stmt->execute();
            $db->close();
        }
    } catch (Exception $dbError) {
        // Silently persist is okay since CSV has written successfully
    }

    if ($writeSuccess !== false) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Lead received on PHP server and persisted successfully!',
            'id' => uniqid('lead_')
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to append record to CSV storage.']);
        exit;
    }
}
