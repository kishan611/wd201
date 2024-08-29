let userForm = document.getElementById("user-form");

const dob = document.getElementById("dob");
let todayDate = new Date().toISOString();
todayDate = todayDate.slice(4, 10);
const year = new Date().getFullYear();
dob.min = `${year - 55}${todayDate}`;
dob.max = `${year - 18}${todayDate}`;

const retrieveEntries = () => {
  let entries = localStorage.getItem("user-entries");
  if (entries) {
    entries = JSON.parse(entries);
  } else {
    entries = [];
  }
  return entries;
};
let userEntries = retrieveEntries();

const displayEntries = () => {
  const entries = retrieveEntries();
  const tableEntries = entries
    .map((entry) => {
      const nameCell = `<td>${entry.name}</td>`;
      const emailCell = `<td>${entry.email}</td>`;
      const passwordCell = `<td>${entry.password}</td>`;
      const dobCell = `<td>${entry.dob}</td>`;
      const acceptTermsCell = `<td>${entry.acceptedTermsAndCondition}</td>`;
      const row = `<tr>${nameCell} ${emailCell} ${passwordCell} ${dobCell} ${acceptTermsCell}</tr>`;
      return row;
    })
    .join("\n");
  const table = `<table><tr>
	<th>Name</th>
	<th>Email</th>
	<th>Password</th>
	<th>Dob</th>
	<th>Accepted terms?</th>
	</tr>${tableEntries}</table>`;
  let details = document.getElementById("user-entries");
  details.innerHTML = table;
};

const saveUserForm = (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const dob = document.getElementById("dob").value;
  const acceptedTermsAndCondition =
    document.getElementById("acceptTerms").checked;
  const entry = {
    name,
    email,
    password,
    dob,
    acceptedTermsAndCondition,
  };
  userEntries.push(entry);
  localStorage.setItem("user-entries", JSON.stringify(userEntries));
  displayEntries();
};
userForm.addEventListener("submit", saveUserForm);
displayEntries();
