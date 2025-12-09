const PatientPrescriptions = () => {
  const prescriptions = [
    { id: 'RX-001', medication: 'Amoxicillin 500mg', dosage: '1 tablet, 3 times daily', duration: '7 days', doctor: 'Dr. Sarah Johnson', date: '2024-12-08', status: 'Active', refills: 0 },
    { id: 'RX-002', medication: 'Lisinopril 10mg', dosage: '1 tablet, once daily', duration: '30 days', doctor: 'Dr. Michael Chen', date: '2024-11-25', status: 'Active', refills: 2 },
    { id: 'RX-003', medication: 'Ibuprofen 400mg', dosage: 'As needed for pain', duration: '14 days', doctor: 'Dr. Sarah Johnson', date: '2024-10-15', status: 'Expired', refills: 0 },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-600 mt-2">View and manage your medications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 text-sm">Active Prescriptions</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{prescriptions.filter(p => p.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 text-sm">Available Refills</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{prescriptions.reduce((acc, p) => acc + p.refills, 0)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-600 text-sm">Expired</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{prescriptions.filter(p => p.status === 'Expired').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{rx.medication}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rx.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rx.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1"><span className="font-medium">Dosage:</span> {rx.dosage}</p>
                <p className="text-gray-600 mb-1"><span className="font-medium">Duration:</span> {rx.duration}</p>
                <p className="text-gray-600 mb-1"><span className="font-medium">Prescribed by:</span> {rx.doctor}</p>
                <p className="text-sm text-gray-500">Prescribed on: {rx.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-3">Refills: {rx.refills}</p>
                {rx.status === 'Active' && rx.refills > 0 && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Request Refill
                  </button>
                )}
                {rx.status === 'Active' && rx.refills === 0 && (
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                    Contact Doctor
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientPrescriptions;
