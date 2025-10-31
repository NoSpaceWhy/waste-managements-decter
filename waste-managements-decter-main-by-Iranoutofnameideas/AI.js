let video = document.getElementById("video");
let resultDiv = document.getElementById("result");

// Start camera
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

// Load AI model
async function startAI() {
  const model = await mobilenet.load(); // Replace with custom waste model

  setInterval(async () => {
    const prediction = await model.classify(video);
    if (prediction.length > 0) {
      let item = prediction[0].className.toLowerCase();

      // Default
      let category = "Unknown ❓";

      let element = "None";

      // 1. Biodegradable / Wet Waste
      if (
        item.includes("banana") ||
        item.includes("apple") ||
        item.includes("food") ||
        item.includes("vegetable") ||
        item.includes("fruit")
      ) {
        category = "Biodegradable / Wet Waste 🌱 (Compost)";
        element = "Carbon(C), Oxygen(O), Hydrogen(H)";
      }

      // 2. Dry Waste / Recyclable
      else if (
        item.includes("bottle") ||
        item.includes("plastic") ||
        item.includes("paper") ||
        item.includes("carton") ||
        item.includes("cardboard") ||
        item.includes("metal") ||
        item.includes("can") ||
        item.includes("glass")
      ) {
        category = "Dry Waste / Recyclable ♻️";

        element =
          "Carbon(C), Oxygen(O), Hydrogen(H), Silicon(Si), Aluminum(Al), Iron(Fe)";
      }

      // 3. Hazardous Waste
      else if (
        item.includes("battery") ||
        item.includes("paint") ||
        item.includes("chemical") ||
        item.includes("pesticide")
      ) {
        category = "Hazardous Waste ☣️";

        element =
          "Lead(Pb), Mercury(Hg), Cadmium(Cd), Chromium(Cr),Arsenic(As) ";
      }

      // 4. Biomedical / Sanitary Waste
      else if (
        item.includes("mask") ||
        item.includes("diaper") ||
        item.includes("sanitary") ||
        item.includes("bandage") ||
        item.includes("syringe")
      ) {
        category = "Biomedical / Sanitary Waste 🏥";

        element =
          "Carbon(C), Oxygen(O), Hydrogen(H), Nitrogen(N) Sulphur(S), Phosphorus(P)";
      }

      // 5. E-Waste
      else if (
        item.includes("phone") ||
        item.includes("projector") ||
        item.includes("hair dryer") ||
        item.includes("charger") ||
        item.includes("computer") ||
        item.includes("tv") ||
        item.includes("laptop") ||
        item.includes("atm")
      ) {
        category = "E-Waste 💻";

        element = "Copper(Cu), Gold(Au), Silver(Ag), Aluminum(Al), Iron(Fe)";
      }

      // 6. Construction & Demolition Waste
      else if (
        item.includes("brick") ||
        item.includes("cement") ||
        item.includes("tile") ||
        item.includes("wood") ||
        item.includes("debris")
      ) {
        category = "Construction & Demolition Waste 🏗️";

        element = "Carbon(C), Oxygen(O), Silicon(Si), Aluminum(Al), Iron(Fe)";
      }
      // resultDiv.innerHTML = `${prediction[0].className} → ${category}`;

      resultDiv.innerHTML = `${category}, May contain ${element} `;
    }
  }, 2000);
}

startAI();
