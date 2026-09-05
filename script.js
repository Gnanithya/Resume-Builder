const STORAGE_KEY = "resumecraft_data_v1";

const defaultData = {
  personal: {
    fullName: "",
    jobTitle: "Software Developer | Fresher",
    phone: "",
    email: "",
    github: "",
    linkedin: "",
    address: ""
  },
  photo: "",
  summary: "",
  education: [
    { type: "Higher Education", degree: "", college: "", grade: "", year: "" }
  ],
  technicalSkills: ["HTML", "CSS", "JavaScript"],
  personalSkills: ["Communication", "Teamwork"],
  languages: [
    { name: "English", level: "Professional" }
  ],
  projects: [
    { type: "Hands-on", title: "", role: "", description: "", link: "" }
  ],
  experience: [
    { type: "Internship", title: "", organization: "", duration: "", description: "" }
  ],
  certificates: [
    { name: "", issuer: "", year: "" }
  ],
  colors: {
    header: "#1d3557",
    body: "#273449"
  },
  darkMode: false
};

let data = loadData();

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return clone(defaultData);
    const parsed = JSON.parse(saved);
    return {
      ...clone(defaultData),
      ...parsed,
      personal: { ...clone(defaultData).personal, ...(parsed.personal || {}) },
      education: Array.isArray(parsed.education) ? parsed.education : clone(defaultData.education),
      technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
      personalSkills: Array.isArray(parsed.personalSkills) ? parsed.personalSkills : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      colors: { ...clone(defaultData).colors, ...(parsed.colors || {}) },
      darkMode: Boolean(parsed.darkMode)
    };
  } catch {
    return clone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const status = document.getElementById("saveStatus");
  status.textContent = "● Saved locally";
  status.style.color = "#2f855a";
}

let saveTimer;
function queueSave() {
  clearTimeout(saveTimer);
  const status = document.getElementById("saveStatus");
  status.textContent = "● Saving...";
  status.style.color = "#a06a00";
  saveTimer = setTimeout(saveData, 250);
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderForm() {
  const p = data.personal;
  document.getElementById("fullName").value = p.fullName || "";
  document.getElementById("jobTitle").value = p.jobTitle || "";
  document.getElementById("phone").value = p.phone || "";
  document.getElementById("email").value = p.email || "";
  document.getElementById("github").value = p.github || "";
  document.getElementById("linkedin").value = p.linkedin || "";
  document.getElementById("address").value = p.address || "";
  document.getElementById("summary").value = data.summary || "";

  renderPhoto();
  renderEducation();
  renderSkills("technicalSkills", data.technicalSkills);
  renderSkills("personalSkills", data.personalSkills);
  renderLanguages();
  renderProjects();
  renderExperience();
  renderCertificates();
  renderColors();
  applyTheme();
  renderPreview();
}

function renderPhoto() {
  const box = document.getElementById("photoPreview");
  if (data.photo) {
    box.innerHTML = `<img src="${data.photo}" alt="Profile photo">`;
  } else {
    box.innerHTML = "<span>👤</span>";
  }
}

function renderEducation() {
  const list = document.getElementById("educationList");
  list.innerHTML = data.education.map((edu, i) => `
    <div class="dynamic-card">
      <div class="card-top">
        <strong>Education ${i + 1}</strong>
        ${data.education.length > 1 ? `<button class="remove-btn" onclick="removeEducation(${i})">Remove</button>` : ""}
      </div>
      <div class="education-grid">
        <div class="field">
          <label>Education Level</label>
          <select onchange="updateEducation(${i}, 'type', this.value)">
            ${["Primary Education", "Secondary Education", "Higher Education"].map(x =>
              `<option ${edu.type === x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Degree / Course</label>
          <input value="${escapeHTML(edu.degree)}" placeholder="B.Tech Computer Science"
            oninput="updateEducation(${i}, 'degree', this.value)">
        </div>
        <div class="field full">
          <label>School / College Name</label>
          <input value="${escapeHTML(edu.college)}" placeholder="ABC College of Engineering"
            oninput="updateEducation(${i}, 'college', this.value)">
        </div>
        <div class="field">
          <label>Grade / Marks / CGPA</label>
          <input value="${escapeHTML(edu.grade)}" placeholder="8.5 CGPA / 85%"
            oninput="updateEducation(${i}, 'grade', this.value)">
        </div>
        <div class="field">
          <label>Year</label>
          <input value="${escapeHTML(edu.year)}" placeholder="2026"
            oninput="updateEducation(${i}, 'year', this.value)">
        </div>
      </div>
    </div>
  `).join("");
}

function updateEducation(index, key, value) {
  data.education[index][key] = value;
  queueSave();
  renderPreview();
}

function removeEducation(index) {
  data.education.splice(index, 1);
  queueSave();
  renderEducation();
  renderPreview();
}

function renderSkills(id, skills) {
  const container = document.getElementById(id);
  container.innerHTML = skills.map((skill, i) => `
    <div class="skill-row">
      <input value="${escapeHTML(skill)}" placeholder="Enter skill"
        oninput="updateSkill('${id}', ${i}, this.value)">
      <button title="Remove" onclick="removeSkill('${id}', ${i})">×</button>
    </div>
  `).join("");
}

function updateSkill(id, index, value) {
  data[id][index] = value;
  queueSave();
  renderPreview();
}

function removeSkill(id, index) {
  data[id].splice(index, 1);
  queueSave();
  renderSkills(id, data[id]);
  renderPreview();
}

function addSkill(id) {
  data[id].push("");
  queueSave();
  renderSkills(id, data[id]);
  renderPreview();
  const inputs = document.querySelectorAll(`#${id} input`);
  inputs[inputs.length - 1]?.focus();
}

function renderLanguages() {
  const list = document.getElementById("languageList");
  list.innerHTML = data.languages.map((lang, i) => `
    <div class="dynamic-card">
      <div class="card-top">
        <strong>Language ${i + 1}</strong>
        <button class="remove-btn" onclick="removeLanguage(${i})">Remove</button>
      </div>
      <div class="education-grid">
        <div class="field">
          <label>Language</label>
          <input value="${escapeHTML(lang.name)}" placeholder="English"
            oninput="updateLanguage(${i}, 'name', this.value)">
        </div>
        <div class="field">
          <label>Proficiency</label>
          <select onchange="updateLanguage(${i}, 'level', this.value)">
            ${["Basic", "Conversational", "Professional", "Fluent", "Native"].map(x =>
              `<option ${lang.level === x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
        </div>
      </div>
    </div>
  `).join("");
}

function updateLanguage(index, key, value) {
  data.languages[index][key] = value;
  queueSave();
  renderPreview();
}

function removeLanguage(index) {
  data.languages.splice(index, 1);
  queueSave();
  renderLanguages();
  renderProjects();
  renderExperience();
  renderCertificates();
  renderColors();
  applyTheme();
  renderPreview();
}

function addLanguage() {
  data.languages.push({ name: "", level: "Professional" });
  queueSave();
  renderLanguages();
  renderProjects();
  renderExperience();
  renderCertificates();
  renderColors();
  applyTheme();
  renderPreview();
}


function renderProjects() {
  const list = document.getElementById("projectList");
  list.innerHTML = data.projects.map((item, i) => `
    <div class="dynamic-card">
      <div class="card-top">
        <strong>Project ${i + 1}</strong>
        <button class="remove-btn" onclick="removeProject(${i})">Remove</button>
      </div>
      <div class="education-grid">
        <div class="field">
          <label>Project Type</label>
          <select onchange="updateProject(${i}, 'type', this.value)">
            ${["Hands-on", "Academic"].map(x => `<option ${item.type === x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Project Title</label>
          <input value="${escapeHTML(item.title)}" placeholder="Student Management System"
            oninput="updateProject(${i}, 'title', this.value)">
        </div>
        <div class="field full">
          <label>Your Role / Technologies</label>
          <input value="${escapeHTML(item.role)}" placeholder="Developer · Python · SQL"
            oninput="updateProject(${i}, 'role', this.value)">
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea rows="3" placeholder="Briefly explain what you built and your contribution."
            oninput="updateProject(${i}, 'description', this.value)">${escapeHTML(item.description)}</textarea>
        </div>
        <div class="field full">
          <label>Project Link <span>Optional</span></label>
          <input value="${escapeHTML(item.link)}" placeholder="https://github.com/username/project"
            oninput="updateProject(${i}, 'link', this.value)">
        </div>
      </div>
    </div>
  `).join("");
}

function updateProject(index, key, value) {
  data.projects[index][key] = value;
  queueSave();
  renderPreview();
}

function removeProject(index) {
  data.projects.splice(index, 1);
  queueSave();
  renderProjects();
  renderPreview();
}

function addProject() {
  data.projects.push({ type: "Hands-on", title: "", role: "", description: "", link: "" });
  queueSave();
  renderProjects();
  renderPreview();
}

function renderExperience() {
  const list = document.getElementById("experienceList");
  list.innerHTML = data.experience.map((item, i) => `
    <div class="dynamic-card">
      <div class="card-top">
        <strong>Internship / Workshop ${i + 1}</strong>
        <button class="remove-btn" onclick="removeExperience(${i})">Remove</button>
      </div>
      <div class="education-grid">
        <div class="field">
          <label>Type</label>
          <select onchange="updateExperience(${i}, 'type', this.value)">
            ${["Internship", "Workshop", "Training"].map(x => `<option ${item.type === x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Title / Role</label>
          <input value="${escapeHTML(item.title)}" placeholder="Software Development Intern"
            oninput="updateExperience(${i}, 'title', this.value)">
        </div>
        <div class="field">
          <label>Company / Organization</label>
          <input value="${escapeHTML(item.organization)}" placeholder="ABC Technologies"
            oninput="updateExperience(${i}, 'organization', this.value)">
        </div>
        <div class="field">
          <label>Duration</label>
          <input value="${escapeHTML(item.duration)}" placeholder="Jun 2025 – Aug 2025"
            oninput="updateExperience(${i}, 'duration', this.value)">
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea rows="3" placeholder="Mention responsibilities, tools and outcomes."
            oninput="updateExperience(${i}, 'description', this.value)">${escapeHTML(item.description)}</textarea>
        </div>
      </div>
    </div>
  `).join("");
}

function updateExperience(index, key, value) {
  data.experience[index][key] = value;
  queueSave();
  renderPreview();
}

function removeExperience(index) {
  data.experience.splice(index, 1);
  queueSave();
  renderExperience();
  renderPreview();
}

function addExperience() {
  data.experience.push({ type: "Internship", title: "", organization: "", duration: "", description: "" });
  queueSave();
  renderExperience();
  renderPreview();
}

function renderCertificates() {
  const list = document.getElementById("certificateList");
  list.innerHTML = data.certificates.map((item, i) => `
    <div class="dynamic-card">
      <div class="card-top">
        <strong>Certificate ${i + 1}</strong>
        <button class="remove-btn" onclick="removeCertificate(${i})">Remove</button>
      </div>
      <div class="education-grid">
        <div class="field full">
          <label>Certificate Name</label>
          <input value="${escapeHTML(item.name)}" placeholder="Python for Data Science"
            oninput="updateCertificate(${i}, 'name', this.value)">
        </div>
        <div class="field">
          <label>Issuing Organization</label>
          <input value="${escapeHTML(item.issuer)}" placeholder="Coursera / NPTEL / Microsoft"
            oninput="updateCertificate(${i}, 'issuer', this.value)">
        </div>
        <div class="field">
          <label>Year</label>
          <input value="${escapeHTML(item.year)}" placeholder="2026"
            oninput="updateCertificate(${i}, 'year', this.value)">
        </div>
      </div>
    </div>
  `).join("");
}

function updateCertificate(index, key, value) {
  data.certificates[index][key] = value;
  queueSave();
  renderPreview();
}

function removeCertificate(index) {
  data.certificates.splice(index, 1);
  queueSave();
  renderCertificates();
  renderPreview();
}

function addCertificate() {
  data.certificates.push({ name: "", issuer: "", year: "" });
  queueSave();
  renderCertificates();
  renderPreview();
}

function renderColors() {
  const header = data.colors?.header || "#1d3557";
  const body = data.colors?.body || "#273449";
  document.getElementById("headerColor").value = header;
  document.getElementById("headerColorText").value = header;
  document.getElementById("bodyColor").value = body;
  document.getElementById("bodyColorText").value = body;
  applyColors();
}

function validHex(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function applyColors() {
  document.documentElement.style.setProperty("--resume-accent", data.colors.header);
  document.documentElement.style.setProperty("--resume-body", data.colors.body);
}

function updateColor(key, value) {
  if (!validHex(value)) return;
  data.colors[key] = value;
  applyColors();
  queueSave();
}

function bindColorInputs() {
  const pairs = [
    ["headerColor", "headerColorText", "header"],
    ["bodyColor", "bodyColorText", "body"]
  ];

  pairs.forEach(([pickerId, textId, key]) => {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);

    picker.addEventListener("input", () => {
      text.value = picker.value;
      updateColor(key, picker.value);
    });

    text.addEventListener("change", () => {
      const value = text.value.startsWith("#") ? text.value : `#${text.value}`;
      if (validHex(value)) {
        picker.value = value;
        updateColor(key, value);
      } else {
        text.value = data.colors[key];
        showToast("Use a valid hex color, e.g. #1D3557");
      }
    });
  });

  document.getElementById("resetColorsBtn").addEventListener("click", () => {
    data.colors = clone(defaultData.colors);
    renderColors();
    saveData();
    showToast("Resume colors reset.");
  });
}

function applyTheme() {
  document.body.classList.toggle("dark", data.darkMode);
  document.getElementById("themeBtn").textContent = data.darkMode ? "☀ Light Mode" : "☾ Dark Mode";
}

function toggleTheme() {
  data.darkMode = !data.darkMode;
  applyTheme();
  queueSave();
}

function renderPreview() {
  const p = data.personal;

  document.getElementById("previewName").textContent = p.fullName || "Your Name";
  document.getElementById("previewTitle").textContent = p.jobTitle || "Software Developer | Fresher";
  document.getElementById("previewPhone").textContent = p.phone || "+91 XXXXX XXXXX";
  document.getElementById("previewEmail").textContent = p.email || "you@example.com";
  document.getElementById("previewAddress").textContent = p.address || "City, State, India";

  setOptionalLink("previewGithub", p.github, "GitHub");
  setOptionalLink("previewLinkedin", p.linkedin, "LinkedIn");

  const summarySection = document.getElementById("previewSummarySection");
  const summary = document.getElementById("previewSummary");
  if (data.summary.trim()) {
    summary.textContent = data.summary;
    summarySection.classList.remove("hidden");
  } else {
    summarySection.classList.add("hidden");
  }

  const edu = data.education.filter(x => x.degree || x.college || x.grade || x.year);
  document.getElementById("previewEducation").innerHTML = edu.length
    ? edu.map(x => `
      <div class="edu-item">
        <div class="edu-top">
          <span class="edu-degree">${escapeHTML(x.degree || x.type || "Education")}</span>
          <span class="edu-date">${escapeHTML(x.year)}</span>
        </div>
        <div class="edu-school">${escapeHTML(x.college)}</div>
        <div class="edu-meta">${escapeHTML(x.type)}${x.grade ? ` · ${escapeHTML(x.grade)}` : ""}</div>
      </div>
    `).join("")
    : `<div class="edu-item"><div class="edu-degree">Your education details</div><div class="edu-school">School / College Name</div></div>`;

  renderPreviewSkills("previewTechnical", data.technicalSkills, "previewTechnicalSection");
  renderPreviewSkills("previewPersonal", data.personalSkills, "previewPersonalSection");

  const langs = data.languages.filter(x => x.name.trim());
  const langSection = document.getElementById("previewLanguagesSection");
  if (!langs.length) {
    langSection.classList.add("hidden");
  } else {
    langSection.classList.remove("hidden");
    document.getElementById("previewLanguages").innerHTML = langs.map(x =>
      `<div class="language-item"><strong>${escapeHTML(x.name)}</strong><span>${escapeHTML(x.level)}</span></div>`
    ).join("");
  }

  const projects = data.projects.filter(x => x.title || x.role || x.description);
  const projectSection = document.getElementById("previewProjectsSection");
  if (!projects.length) {
    projectSection.classList.add("hidden");
  } else {
    projectSection.classList.remove("hidden");
    document.getElementById("previewProjects").innerHTML = projects.map(x => `
      <div class="resume-project">
        <div class="item-title-row">
          <span class="item-title">${escapeHTML(x.title || "Project")}</span>
          <span class="item-type">${escapeHTML(x.type)}</span>
        </div>
        ${x.role ? `<div class="item-subtitle">${escapeHTML(x.role)}</div>` : ""}
        ${x.description ? `<div class="item-description">${escapeHTML(x.description)}</div>` : ""}
        ${x.link ? `<div class="item-link">${escapeHTML(x.link.replace(/^https?:\/\//, ""))}</div>` : ""}
      </div>
    `).join("");
  }

  const experiences = data.experience.filter(x => x.title || x.organization || x.description);
  const experienceSection = document.getElementById("previewExperienceSection");
  if (!experiences.length) {
    experienceSection.classList.add("hidden");
  } else {
    experienceSection.classList.remove("hidden");
    document.getElementById("previewExperience").innerHTML = experiences.map(x => `
      <div class="resume-experience">
        <div class="item-title-row">
          <span class="item-title">${escapeHTML(x.title || x.type)}</span>
          <span class="item-date">${escapeHTML(x.duration)}</span>
        </div>
        <div class="item-subtitle">${escapeHTML(x.organization)}${x.organization && x.type ? ` · ${escapeHTML(x.type)}` : escapeHTML(x.type)}</div>
        ${x.description ? `<div class="item-description">${escapeHTML(x.description)}</div>` : ""}
      </div>
    `).join("");
  }

  const certificates = data.certificates.filter(x => x.name || x.issuer);
  const certificateSection = document.getElementById("previewCertificatesSection");
  if (!certificates.length) {
    certificateSection.classList.add("hidden");
  } else {
    certificateSection.classList.remove("hidden");
    document.getElementById("previewCertificates").innerHTML = certificates.map(x => `
      <div class="resume-certificate">
        <div class="item-title-row">
          <span class="item-title">${escapeHTML(x.name || "Certificate")}</span>
          <span class="item-date">${escapeHTML(x.year)}</span>
        </div>
        <div class="item-subtitle">${escapeHTML(x.issuer)}</div>
      </div>
    `).join("");
  }

  const photo = document.getElementById("resumePhoto");
  if (data.photo) {
    document.getElementById("previewPhoto").src = data.photo;
    photo.classList.remove("hidden");
  } else {
    photo.classList.add("hidden");
  }
}

function setOptionalLink(id, value, label) {
  const el = document.getElementById(id);
  if (value && value.trim()) {
    el.textContent = value.replace(/^https?:\/\//, "");
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function renderPreviewSkills(containerId, skills, sectionId) {
  const clean = skills.filter(x => x.trim());
  const section = document.getElementById(sectionId);
  if (!clean.length) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");
  document.getElementById(containerId).innerHTML = clean
    .map(x => `<span class="resume-tag">${escapeHTML(x)}</span>`)
    .join("");
}

function bindPersonalInputs() {
  const map = {
    fullName: "fullName",
    jobTitle: "jobTitle",
    phone: "phone",
    email: "email",
    github: "github",
    linkedin: "linkedin",
    address: "address"
  };

  Object.entries(map).forEach(([key, id]) => {
    document.getElementById(id).addEventListener("input", e => {
      data.personal[key] = e.target.value;
      queueSave();
      renderPreview();
    });
  });

  document.getElementById("summary").addEventListener("input", e => {
    data.summary = e.target.value;
    queueSave();
    renderPreview();
  });
}

function showSection(name) {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === name);
  });
  document.querySelectorAll(".section-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `section-${name}`);
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function clearAll() {
  const confirmed = confirm("Clear all resume data? This cannot be undone.");
  if (!confirmed) return;
  data = clone(defaultData);
  localStorage.removeItem(STORAGE_KEY);
  renderForm();
  showToast("All resume data cleared.");
}

function handlePhoto(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    data.photo = reader.result;
    queueSave();
    renderPhoto();
    renderPreview();
    showToast("Profile photo updated.");
  };
  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", () => {
  bindPersonalInputs();
  renderForm();

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });

  document.getElementById("addEducationBtn").addEventListener("click", () => {
    data.education.push({
      type: "Higher Education",
      degree: "",
      college: "",
      grade: "",
      year: ""
    });
    queueSave();
    renderEducation();
    renderPreview();
  });

  document.getElementById("addTechnicalBtn").addEventListener("click", () => addSkill("technicalSkills"));
  document.getElementById("addPersonalBtn").addEventListener("click", () => addSkill("personalSkills"));
  document.getElementById("addLanguageBtn").addEventListener("click", addLanguage);
  document.getElementById("addProjectBtn").addEventListener("click", addProject);
  document.getElementById("addExperienceBtn").addEventListener("click", addExperience);
  document.getElementById("addCertificateBtn").addEventListener("click", addCertificate);

  bindColorInputs();

  document.getElementById("themeBtn").addEventListener("click", toggleTheme);

  document.getElementById("photoInput").addEventListener("change", e => handlePhoto(e.target.files[0]));

  document.getElementById("removePhotoBtn").addEventListener("click", () => {
    data.photo = "";
    document.getElementById("photoInput").value = "";
    queueSave();
    renderPhoto();
    renderPreview();
    showToast("Profile photo removed.");
  });

  document.getElementById("clearBtn").addEventListener("click", clearAll);

  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    window.print();
  });
});
