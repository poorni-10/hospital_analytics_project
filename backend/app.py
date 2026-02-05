from flask import Flask, render_template, request, url_for
import pandas as pd
import random

app = Flask(__name__)

# --- HELPER FUNCTION: Load Dataset Stats ---
def get_hospital_stats():
    """
    Reads the dataset to provide real-time averages for the dashboard.
    """
    try:
        # Loading your specific dataset
        df = pd.read_excel('cleaned hospital dataset.ods', engine='odf')
        stats = {
            'avg_pulse': round(df['pulse'].mean(), 1),
            'avg_los': round(df['lengthofstay'].mean(), 1),
            'total_beds': 50,
            'occupied_beds': len(df) % 50, 
        }
        stats['vacant_beds'] = stats['total_beds'] - stats['occupied_beds']
    except Exception as e:
        # Fallback values if file is missing or odfpy is not installed
        stats = {'avg_pulse': 72.4, 'avg_los': 5.2, 'vacant_beds': 14}
    return stats

# --- ROUTES ---

@app.route('/')
@app.route('/dashboard')
def dashboard_view():
    """Renders the main dashboard with hospital stats and patient table."""
    stats = get_hospital_stats()
    
    # Dummy data for the 'Recent Patient Flow' table on the dashboard
    recent_patients = [
        {'id': '101', 'dept': 'ICU', 'status': 'Stable', 'risk': 'Low'},
        {'id': '102', 'dept': 'Surgery', 'status': 'Recovering', 'risk': 'Med'},
        {'id': '103', 'dept': 'General', 'status': 'Observation', 'risk': 'High'}
    ]
    
    return render_template('index.html', 
                           page="dashboard",
                           avg_heart_rate=stats['avg_pulse'], 
                           avg_los=stats['avg_los'],
                           vacant_beds=stats['vacant_beds'],
                           patients=recent_patients)

@app.route('/new_patient')
def new_patient_view():
    """Directs user to the patient input form section."""
    stats = get_hospital_stats()
    return render_template('index.html', 
                           page="new_patient", 
                           vacant_beds=stats['vacant_beds'])

@app.route('/check_beds')
def bed_check():
    """Logic specifically for checking bed vacancy."""
    stats = get_hospital_stats()
    return render_template('index.html', 
                           page="dashboard", # Returns to dashboard view
                           vacant_beds=stats['vacant_beds'],
                           check_mode=True)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Captures patient data and calculates clinical/operational outcomes.
    """
    # 1. Capture Form Data
    pulse = float(request.form.get('pulse', 80))
    bmi = float(request.form.get('bmi', 22))
    glucose = float(request.form.get('glucose', 0))
    admission_type = request.form.get('gender') # '1' for Emergency
    dept = request.form.get('department', 'General Medicine')

    # 2. ANALYSIS LOGIC
    # Predicted Length of Stay (LOS)
    predicted_los = 3 + (bmi * 0.1) + (1.5 if admission_type == '1' else 0)
    predicted_los = round(predicted_los, 1)

    # Nurse Working Hours (Complexity-based)
    base_shift = 8
    complexity = 1.4 if (pulse > 100 or bmi > 30) else 1.0
    total_nurse_hours = round(predicted_los * base_shift * complexity, 1)

    # Bed Allocation Logic
    stats = get_hospital_stats()
    if stats['vacant_beds'] > 0:
        bed_status = f"Allocated: Room {random.randint(101, 199)}-{random.choice(['A', 'B'])}"
    else:
        bed_status = "Waitlisted (Wards Full)"

    # 3. Render the Results Page
    return render_template('results.html', 
                           los=predicted_los, 
                           nurse_hours=total_nurse_hours, 
                           bed_status=bed_status,
                           pulse=pulse,
                           department=dept)

if __name__ == '__main__':
    app.run(debug=True)