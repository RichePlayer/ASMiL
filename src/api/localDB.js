
// ======================== src/api/localDB.js ========================================= //
let _id = 1000;
const nextId = () => (++_id).toString();
const nowIso = () => new Date().toISOString();

function clone(v) { return JSON.parse(JSON.stringify(v)); }

function matchFilter(item, filterObj = {}) {
  return Object.entries(filterObj).every(([k, v]) => {
    if (v === undefined || v === null) return true;
    return item[k] == v;
  });
}

function makeEntity(initial = []) {
  const list = clone(initial);
  return {
    async list(sort = null, limit = 1000) {
      let arr = [...list];
      if (sort === "-created_date") {
        arr.sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
      } else if (sort === "created_date") {
        arr.sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));
      }
      if (limit) arr = arr.slice(0, limit);
      return clone(arr);
    },
    async filter(filterObj = {}) {
      return clone(list.filter((it) => matchFilter(it, filterObj)));
    },
    async create(data) {
      const item = { id: nextId(), created_date: nowIso(), ...data };
      list.push(item);
      return clone(item);
    },
    async update(id, data) {
      const idx = list.findIndex((it) => it.id === id);
      if (idx === -1) throw new Error("Not found");
      list[idx] = { ...list[idx], ...data, updated_date: nowIso() };
      return clone(list[idx]);
    },
    async delete(id) {
      const idx = list.findIndex((it) => it.id === id);
      if (idx === -1) throw new Error("Not found");
      return clone(list.splice(idx, 1)[0]);
    },
    _dump() { return clone(list); }
  };
}

/* ---------------- CATEGORIES ---------------- */
const categoriesInit = [
  { id: "c1", created_date: nowIso(), name: "Langue" },
  { id: "c2", created_date: nowIso(), name: "Bureautique" },
  { id: "c3", created_date: nowIso(), name: "Entrepreneuriat" },
];

/* ---------------- FORMATIONS ---------------- */
const formationsInit = [
  {
    id: "f1",
    created_date: nowIso(),
    category_id: "c2",
    title: "Excel Avancé",
    description: "Maîtriser les fonctions avancées d’Excel.",
    duration_months: 2,
    price: 150000,
    type: "certifiante",
    image_url: "",
    prerequisites: "Connaissances Excel de base",
  },
];

/* ---------------- MODULES ---------------- */
const modulesInit = [
  {
    id: "m1",
    created_date: nowIso(),
    formation_id: "f1",
    title: "Fonctions avancées",
    description: "RechercheV, Index, Match...",
    hours: 10,
  },
  {
    id: "m2",
    created_date: nowIso(),
    formation_id: "f1",
    title: "Tableaux croisés dynamiques",
    description: "Analyse de données",
    hours: 8,
  },
];

/* ---------------- SESSIONS ---------------- */
const sessionsInit = [
  {
    id: "se1",
    created_date: nowIso(),
    formation_id: "f1",
    module_id: "m1",
    teacher_id: "t1",
    start_date: "2025-11-01",
    end_date: "2025-11-30",
    room: "Salle A",
    status: "en cours",
  },
];

/* ---------------- TEACHERS ---------------- */
const teachersInit = [
  {
    id: "t1",
    created_date: nowIso(),
    registration_number: "T-2024-001",
    first_name: "Jean",
    last_name: "Rabet",
    email: "jean.rabet@example.com",
    phone: "+261 34 12 345 67",
    photo_url: "",
    specialties: ["Excel", "Comptabilité"],
    bio: "Formateur expérimenté.",
    status: "actif",
    hire_date: "2021-09-01",
    hourly_rate: 15000,
    availability: [],
  },
];

/* ---------------- STUDENTS ---------------- */
const studentsInit = [
  {
    id: "s1",
    created_date: nowIso(),
    registration_number: "ETU-2025-001",
    first_name: "Rija",
    last_name: "Rakoto",
    date_of_birth: "2005-03-12",
    gender: "Homme",
    email: "rija@example.com",
    phone_parent: "+261 34 11 222 33",
    address: "Antananarivo",
    status: "actif",
    enrollment_date: "2025-09-01",
    photo_url: "",
  },
];

/* ---------------- ENROLLMENTS ---------------- */
const enrollmentsInit = [
  { id: "en1", created_date: nowIso(), student_id: "s1", session_id: "se1", status: "actif" }
];

/* ---------------- INVOICES ---------------- */
const invoicesInit = [
  {
    id: "inv1",
    created_date: nowIso(),
    invoice_number: "FAC-001",
    enrollment_id: "en1",
    amount: 150000,
    status: "payée",
    due_date: "2025-11-15"
  }
];

/* ---------------- ENTITIES EXPORT ---------------- */
export const categoryAPI = makeEntity(categoriesInit);
export const formationAPI = makeEntity(formationsInit);
export const moduleAPI = makeEntity(modulesInit);
export const sessionAPI = makeEntity(sessionsInit);
export const teacherAPI = makeEntity(teachersInit);
export const studentAPI = makeEntity(studentsInit);
export const enrollmentAPI = makeEntity(enrollmentsInit);
export const invoiceAPI = makeEntity(invoicesInit);

/* ---------------- UPLOAD SIMULATOR ---------------- */
export const uploadAPI = {
  async UploadFile({ file }) {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && file && URL.createObjectURL) {
        resolve({ file_url: URL.createObjectURL(file) });
      } else {
        resolve({ file_url: `data:application/octet-stream;name=${file?.name || "file"}` });
      }
    });
  },
};

/* ---------------- DEFAULT EXPORT ---------------- */
export default {
  categoryAPI,
  formationAPI,
  moduleAPI,
  sessionAPI,
  teacherAPI,
  studentAPI,
  enrollmentAPI,
  invoiceAPI,
  uploadAPI,
};
