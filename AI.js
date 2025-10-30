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

      // 1. Biodegradable / Wet Waste
      if (
        item.includes("banana") ||
        item.includes("apple") ||
        item.includes("food") ||
        item.includes("vegetable") ||
        item.includes("fruit")
      ) {
        category = "Biodegradable / Wet Waste 🌱 (Compost)";
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
      }

      // 3. Hazardous Waste
      else if (
        item.includes("battery") ||
        item.includes("paint") ||
        item.includes("chemical") ||
        item.includes("pesticide")
      ) {
        category = "Hazardous Waste ☣️";
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
      }

      resultDiv.innerHTML = `${prediction[0].className} → ${category}`;
    }
  }, 2000);
}

startAI();
