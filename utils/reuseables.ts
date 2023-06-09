import { Biometrics } from "@/lib/models";
import AWS from "aws-sdk";
import axios from "axios";
import { ObjectId } from "mongodb";
import IPinfoWrapper, { IPinfo, AsnResponse } from "node-ipinfo";

export const guidelinesArr = [
  {
    title: "Photo size",
    text: "Standard format: 2 x 2 inches (or 51 x 51 mm) in size (White Background)",
  },
  {
    title: "Width of face",
    text: "Between 16 mm and 20 mm from ear to ear.",
  },
  {
    title: "Length of face",
    text: "Ages 11 and above: between 26 mm and 30 mm from chin to crown.",
    img: "length-of-face",
    errors: ["other side not visible", "not centeralized"],
  },
  {
    title: "Quality of photo",
    list: [
      "colour photo",
      "true likeness and no more than six months old when the application is submitted",
      "natural representation",
      "sharp image, with sufficient contrast and detail",
      "undamaged",
      "not a reproduction (copy)",
      "unaltered by computer software",
      "printed on high-quality, smooth photo paper",
      "minimum 400 dpi resolution",
    ],
    img: "quality-of-photo",
    errors: ["blurry image", "too little contrast"],
  },
  {
    title: "Glasses",
    list: [
      "eyes fully visible",
      "fully transparent lenses",
      "no glare on the glasses",
      "no shadow",
    ],
    img: "glasses",
    errors: ["blurry image", "too little contrast"],
  },
];

export const guidelines2 = [
  {
    title: "Lightning",
    list: [
      "even",
      "not overexposed or underexposed",
      "no shadow on the face or in the background",
      "no reflection on the face",
      "no reflection caused by accessories",
    ],
    img: "lightning",
    errors: ["non-uniform color"],
  },
  {
    title: "Position",
    list: [
      "head facing forward",
      "eyes horizontally aligned",
      "head not tilted",
      "shoulders straight",
    ],
    img: "position",
    errors: ["head tilted"],
  },
  {
    title: "Background",
    list: [
      "White",
      "plain",
      "all one colour",
      "uniform colour (no fade)",
      "sufficient contrast with head",
    ],
    img: "background",
    errors: ["head tilted"],
  },
];

export const boysHostels = [
  "Eni Njoku",
  "King Jaja",
  "Mariere",
  "Saburi Biobaku",
  "Sodeinde",
  "The El Kanemi",
];

export const girlsHostels = [
  "Fagunwa",
  "Kofo Ademola",
  "Madam Tinubu",
  "Honours",
  "Queen Amina",
  "Makama-Bida",
  "Queen Moremi",
];

export function numberWithCommas(x) {
  var parts = x?.toString()?.split(".");
  parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export const convertDate = (date) => {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  const hours = newDate.getHours();
  const minutes = newDate.getMinutes();
  var hour;
  if (hours > 12) {
    hour = hours - 12;
  } else {
    hour = hours;
  }
  return `${day < 10 ? `0${day}` : day}/${
    month < 10 ? `0${month}` : month
  }/${year} ${hour < 10 ? `0${hour}` : hour}:${
    minutes < 10 ? `0${minutes}` : minutes
  } ${hours > 12 ? `PM` : `AM`}`;
};

export async function convertImage(imageUrl, callback) {
  fetch(imageUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        callback(base64String);
      };
      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      console.error("Error converting image to base64:", error);
      callback(null);
    });
}

export const facialRecogntion = async (matricNo, img1, img2) => {
  console.log("Its running");
  const apiKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;
  const apiRegion = process.env.AWS_REGION;

  AWS.config.update({
    accessKeyId: apiKey,
    secretAccessKey: awsSecret,
    region: apiRegion,
  });
  const rekognition = new AWS.Rekognition();

  // Function to convert base64 image to binary data
  function convertBase64ToBinary(base64String) {
    const binaryData = Buffer.from(base64String, "base64");
    return binaryData;
  }

  // Base64 image data
  const base64Image1 = img1;
  const base64Image2 = img2;

  // Convert base64 images to binary data
  const imageBinary1 = convertBase64ToBinary(base64Image1);
  const imageBinary2 = convertBase64ToBinary(base64Image2);

  // Define the parameters for the face detection request for Image 1
  const params1 = {
    Image: {
      Bytes: imageBinary1,
    },
  };
  // Define the parameters for the face detection request for Image 2
  const params2 = {
    Image: {
      Bytes: imageBinary2,
    },
  };

  // Perform the face detection request for Image 1
  const detectedFaces1 = await rekognition.detectFaces(params1).promise();
  console.log("Detected faces for Image 1:", detectedFaces1.FaceDetails);

  // Perform the face detection request for Image 2
  const detectedFaces2 = await rekognition.detectFaces(params2).promise();
  console.log("Detected faces for Image 2:", detectedFaces2.FaceDetails);

  // Perform face comparison if at least one face is detected in both images
  if (
    detectedFaces1.FaceDetails.length > 0 &&
    detectedFaces2.FaceDetails.length > 0
  ) {
    const compareParams = {
      SourceImage: {
        Bytes: imageBinary1,
      },
      TargetImage: {
        Bytes: imageBinary2,
      },
      SimilarityThreshold: 80, // Adjust the similarity threshold as needed
    };

    // Perform the face comparison request
    const faceComparisonResult = await rekognition
      .compareFaces(compareParams)
      .promise();
    console.log("Face comparison result:", faceComparisonResult.FaceMatches);

    // Process the face comparison result
    if (faceComparisonResult.FaceMatches.length > 0) {
      const similarity = faceComparisonResult.FaceMatches[0].Similarity;
      console.log("Similarity:", similarity);
      try {
        // Update the document in the Biometrics collection with the similarity value

        if (similarity >= 80) {
          // await Biometrics.updateOne({ matricNo }, { confidence: similarity });
          console.log("Faces match!");
        } else {
          console.log("Faces do not match!");
        }
      } catch (error) {
        console.error(
          "Error updating document in Biometrics collection:",
          error
        );
      }
    } else {
      console.log("No face matches found.");
      return 0;
    }
  }
};

export const getColor = (status) => {
  var statusNew = status.toLowerCase();
  switch (statusNew) {
    case "approved":
      return {
        bg: "#ECFDF3",
        text: "#027A48",
      };

    case "pending":
      return {
        bg: "#FFF8E2",
        text: "#F79009",
      };
    case "rejected":
      return {
        bg: "#FFECEF",
        text: "#DD6262",
      };
    case "reversed":
      return {
        bg: "#EEEEEE",
        text: "#000000",
      };
    default:
      return {
        bg: "#FEFEFE",
        text: "#000000",
      };
  }
};

export const getLocation = (ip) => {
  const ipinfoWrapper = new IPinfoWrapper(process.env.IP_LOOKUP);

  ipinfoWrapper.lookupIp(ip).then((response: IPinfo) => {
    console.log(response);
  });

  // ipinfoWrapper.lookupASN("AS7922").then((response: AsnResponse) => {
  //     console.log(response);
  // });
};
