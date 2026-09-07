const express = require("express");
const router = express.Router();

const content = {
  "Newton's Third Law": {
    movie: {
      title: "Rocket Launch",
      youtubeUrl: "https://youtu.be/SPZJFnym8Q0",
      start: 32,
      end: 38
    },
    realWorld: {
      title: "Ball Bouncing and Swimming",
      youtubeUrl: "https://youtu.be/dCF--YOjiOw",
      start: 44,
      end: 50
    }
  },

  "Volcanoes and Earthquakes": {
    movie: {
      title: "Volcanic Eruption",
      youtubeUrl: "https://youtu.be/S1Kbym7WYzs",
      start: 86,
      end: 150
    },
    realWorld: {
      title: "Earthquake Destruction",
      youtubeUrl: "https://youtu.be/t6mDtqXtYCo",
      start: 140,
      end: 182
    }
  },

  "Light and Reflection": {
    movie: {
      title: "Reflection Through Mirrors",
      youtubeUrl: "https://youtu.be/kN2UjCFGdY0",
      start: 62,
      end: 83
    },
    realWorld: {
      title: "Reflection on Water",
      youtubeUrl: "https://youtu.be/saRPCTmnaSw",
      start: 130,
      end: 138
    }
  },

  "Magnetism": {
    movie: {
      title: "Magnetic Attraction of Metal Objects",
      youtubeUrl: "https://youtu.be/xojgT5L2cDc",
      start: 470,
      end: 505
    },
    realWorld: {
      title: "Magnetic Attraction and Repulsion",
      youtubeUrl: "https://youtube.com/shorts/Qy4q9lqTTMY",
      start: 0,
      end: 14
    }
  },

  "Equality and Social Discrimination": {
    movie: {
      title: "Social Discrimination",
      youtubeUrl: "https://youtu.be/DvZMKC96Utk",
      start: 30,
      end: 86
    },
    realWorld: {
      title: "Equality and Social Inclusion",
      youtubeUrl: "https://youtu.be/iPiqZ1NrA5o",
      start: 257,
      end: 285
    }
  },

  "Climate Change": {
    movie: {
      title: "Effects of Climate Change",
      youtubeUrl: "https://youtu.be/mjw8KdCBHsc",
      start: 0,
      end: 40
    },
    realWorld: {
      title: "Environmental Impact of Climate Change",
      youtubeUrl: "https://youtu.be/G4H1N_yXBiA",
      start: 72,
      end: 124
    }
  },

  "Artificial Intelligence": {
    movie: {
      title: "AI Processing and Learning",
      youtubeUrl: "https://youtu.be/U0hejW_9hF4",
      start: 58,
      end: 76
    },
    realWorld: {
      title: "AI Assistant Interaction",
      youtubeUrl: "https://youtu.be/rt1dBr2Jz78",
      start: 80,
      end: 120
    }
  },

  "Robotics": {
    movie: {
      title: "Automated Suit Assembly",
      youtubeUrl: "https://youtu.be/t86sKsR4pnk",
      start: 70,
      end: 120
    },
    realWorld: {
      title: "Automated Cleaning Robot",
      youtubeUrl: "https://youtu.be/nLx_7wEmwms",
      start: 100,
      end: 126
    }
  },

  "Photosynthesis": {
    movie: {
      title: "Photosynthesis Process",
      youtubeUrl: "https://youtu.be/Y5dRycQMHk0",
      start: 12,
      end: 62
    },
    realWorld: {
      title: "Oxygen Release During Photosynthesis",
      youtubeUrl: "https://youtube.com/shorts/35SIa6d-beU",
      start: 0,
      end: 16
    }
  },

  "Electricity and Circuits": {
    movie: {
      title: "Using Electricity During a Power Emergency",
      youtubeUrl: "https://youtu.be/0qmazUYTYGM",
      start: 260,
      end: 347
    },
    realWorld: {
      title: "Simple Electric Circuit",
      youtubeUrl: "https://youtu.be/x4pdzG-DHnY",
      start: 40,
      end: 62
    }
  }
};

router.post("/", (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({
      error: "Topic is required"
    });
  }

  const result = content[topic];

  if (!result) {
    return res.status(404).json({
      error: "Content not found for this topic"
    });
  }

  res.json(result);
});

module.exports = router;