const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate");
const User = require("../models/user");
const { jwtAuthMiddleware } = require("./jwt");

const checkAdmin = async (userId) => {
  try {
    const user = await User.findbyId(userId);
    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    return false;
  }
};
// Create a new Candidate by Admin role
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdmin(req.user.id)) {
      return res
        .status(403)
        .send({ message: "Does not have Admin permission" });
    }
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("data saved");
    res.status(200).send({ message: "Candidate saved successfully " });
  } catch (e) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//Update the candidate by Admin role
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdmin(req.user.id))
      return res.status(403).json({ message: "user does not have admin role" });

    const candidateId = req.params.candidateId;
    const updatedCandidate = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidate,
      {
        new: true, // update the candidate
        runValidators: true, //Run mongoose validation
      }
    );
    console.log("Data updated");
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating candidate" });
  }
});

// Delete the candidate
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdmin(req.user.id)) {
      return res
        .status(403)
        .send({ message: "Does not have Admin permission" });
    }
    const candidateId = req.params.candidateId;
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      res.status(404).send({ message: "Not Found" });
    }

    res.status(200).send({ message: "Data deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error deleting candidate" });
  }
});

//Voting Routes
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //User can vote Once
  const candidateId = req.params.candidateId;
  const userId = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).send({ message: "No candidate found " });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found " });
    }
    if (user.isVoted) {
      return res.status(200).send({ message: "user already voted " });
    }
    if (user.role === "admin") {
      return res.status(403).send({ message: "Admin is not allowed" });
    }
    candidate.vote.push({ user: user });
    candidate.voteCount+=1;
    await candidate.save();
    user.isVoted = true;
    await user.save();
    res.status(200).send({ message: "Vote was successfully added" });
  } catch (err) {
    console.log(err);
  }
});

router.get('/vote/count', async (req, res) => {
  try{
    // Find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({voteCount: 'desc'});

    // Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data)=>{
        return {
            party: data.party,
            count: data.voteCount
        }
    });

    return res.status(200).json(voteRecord);
}catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
}
});

router.get('/', async (req, res) => {
  try {
      // Find all candidates and select only the name and party fields, excluding _id
      const candidates = await Candidate.find({}, 'name party -_id');

      // Return the list of candidates
      res.status(200).json(candidates);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
