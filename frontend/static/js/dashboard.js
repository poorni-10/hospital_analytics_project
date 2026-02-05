// 1. Navigation Logic
function showSection(id, el) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Update Sidebar UI
    if(el) {
        document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
        el.classList.add('active');
    }
}

// 2. Dashboard Charts Logic (Unchanged as requested)
const ctx1 = document.getElementById('admissionChart');
const ctx2 = document.getElementById('bedChart');
const ctx3 = document.getElementById('riskDistChart');

new Chart(ctx1, { type: 'line', data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Admissions', data: [35, 42, 38, 55, 48, 70, 65], borderColor: '#4318FF', tension: 0.4, fill: true, backgroundColor: 'rgba(67, 24, 255, 0.05)' }] } });
new Chart(ctx2, { type: 'doughnut', data: { labels: ['ICU', 'ER', 'Gen', 'Ped'], datasets: [{ data: [18, 12, 45, 10], backgroundColor: ['#FF5B5C', '#FFB547', '#4318FF', '#2D9CDB'] }] }, options: { cutout: '70%', plugins: { legend: { position: 'bottom' } } } });
new Chart(ctx3, { type: 'bar', data: { labels: ['Critical', 'High', 'Mod', 'Stable', 'Discharge'], datasets: [{ label: 'Patients', data: [5, 12, 25, 40, 15], backgroundColor: '#4318FF', borderRadius: 8 }] } });

// 3. AI Analysis & Backend Connection Logic
async function analyzeData() {
    const btn = document.getElementById('predictBtn');
    
    // Collect all 22 values into a single JSON object
    const patientData = {
        vitals: {
            age: document.getElementById('v1').value,
            spo2: document.getElementById('v2').value,
            sys_bp: document.getElementById('v3').value,
            dia_bp: document.getElementById('v4').value,
            hr: document.getElementById('v5').value,
            rr: document.getElementById('v6').value,
            temp: document.getElementById('v7').value,
            bmi: document.getElementById('v8').value
        },
        labs: {
            glucose: document.getElementById('v9').value,
            wbc: document.getElementById('v10').value,
            hb: document.getElementById('v11').value,
            creatinine: document.getElementById('v12').value,
            troponin: document.getElementById('v13').value,
            ddimer: document.getElementById('v14').value,
            crp: document.getElementById('v15').value,
            platelets: document.getElementById('v16').value
        },
        risks: {
            gcs: document.getElementById('v17').value,
            pain: document.getElementById('v18').value,
            oxygen: document.getElementById('v19').value,
            diabetes: document.getElementById('v20').value,
            hypertension: document.getElementById('v21').value,
            prev_adm: document.getElementById('v22').value
        }
    };

    // UI Feedback: Start Loading
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Processing...`;

    try {
        /* CONNECTING TO BACKEND:
           Replace 'http://127.0.0.1:5000/predict' with your real API URL later.
        */
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });

        if (!response.ok) throw new Error('Backend not connected');

        const result = await response.json();
        updateUI(result);

    } catch (error) {
        console.warn("Backend not found. Falling back to local simulation logic.");
        // Local Simulation Logic (so your demo still works without the backend running)
        simulateLocalAI(patientData.vitals.spo2);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'PROCESS 22-POINT ANALYSIS';
    }
}

// 4. Update UI with Results
function updateUI(data) {
    document.getElementById('riskValue').innerText = data.risk;
    document.getElementById('wardValue').innerText = data.ward;
    document.getElementById('stayValue').innerText = data.stay;
    showSection('prediction-result', null);
}

// 5. Simulation Logic (For Demo purposes)
function simulateLocalAI(spo2Value) {
    const spo2 = parseFloat(spo2Value) || 100;
    let risk = "STABLE", color = "text-success", ward = "Observation", stay = "0-1 Day";

    if (spo2 < 90) {
        risk = "CRITICAL"; color = "text-danger"; ward = "ICU"; stay = "10+ Days";
    } else if (spo2 < 94) {
        risk = "ELEVATED"; color = "text-warning"; ward = "General Med"; stay = "3-5 Days";
    }

    document.getElementById('riskValue').innerText = risk;
    document.getElementById('riskValue').className = `fw-bold mt-2 ${color}`;
    document.getElementById('wardValue').innerText = ward;
    document.getElementById('stayValue').innerText = stay;
    showSection('prediction-result', null);
}