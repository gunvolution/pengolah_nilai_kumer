// Konfigurasi Supabase
const SUPABASE_URL = 'cqcafgzdqktlfqbjmerd';
const SUPABASE_ANON_KEY = 'sb_publishable_DXGCdxbIicrvs6PI4qPDBg_ktpTTsCI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi memuat data profil sekolah
async function loadSchoolConfig() {
    const { data, error } = await supabase.from('school_config').select('*').single();
    if (data) {
        document.getElementById('school-info').innerText = 
            `${data.school_name} | Tahun Ajaran ${data.academic_year} | Semester ${data.semester}`;
    } else if (error) {
        console.error('Error config:', error.message);
    }
}

// Fungsi memuat data siswa
async function loadStudents() {
    const { data, error } = await supabase.from('student_scores').select('*').order('name', { ascending: true });
    
    if (error) {
        console.error('Error load students:', error.message);
        return;
    }

    const tbody = document.getElementById('student-list');
    tbody.innerHTML = '';

    data.forEach(student => {
        // Logika sederhana deskripsi otomatis
        let status = student.final_score >= 75 ? "Tercapai" : "Perlu Bimbingan";
        let statusColor = student.final_score >= 75 ? "text-green-600" : "text-red-600";

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-3 border-b">${student.nisn}</td>
            <td class="p-3 border-b font-medium">${student.name}</td>
            <td class="p-3 border-b">${student.tp1}</td>
            <td class="p-3 border-b">${student.tp2}</td>
            <td class="p-3 border-b">${student.sas}</td>
            <td class="p-3 border-b font-bold"><span class="${statusColor}">${Math.round(student.final_score)} (${status})</span></td>
            <td class="p-3 border-b">
                <button onclick="deleteStudent('${student.id}')" class="text-red-500 hover:underline">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Menangani form submit (Simpan/Update data)
document.getElementById('score-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nisn = document.getElementById('nisn').value;
    const name = document.getElementById('name').value;
    const tp1 = parseFloat(document.getElementById('tp1').value);
    const tp2 = parseFloat(document.getElementById('tp2').value);
    const sas = parseFloat(document.getElementById('sas').value);

    // Menggunakan upsert agar jika NISN sama, data di-update
    const { error } = await supabase.from('student_scores').upsert(
        { nisn, name, tp1, tp2, sas },
        { onConflict: 'nisn' }
    );

    if (error) {
        alert('Gagal menyimpan data: ' + error.message);
    } else {
        document.getElementById('score-form').reset();
        loadStudents();
    }
});

// Fungsi menghapus siswa
window.deleteStudent = async (id) => {
    if(confirm('Yakin ingin menghapus data siswa ini?')) {
        const { error } = await supabase.from('student_scores').delete().eq('id', id);
        if (!error) {
            loadStudents();
        }
    }
}

// Inisialisasi awal
loadSchoolConfig();
loadStudents();
