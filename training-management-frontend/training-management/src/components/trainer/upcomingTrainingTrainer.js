import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BASE_URL from '../../utils/api';
import './upcomingTrainingTrainer.css';

const UpcomingTrainingTrainer = () => {
  const [upcomingTrainings, setUpcomingTrainings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingTrainings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/trainer/upcoming-trainings`);
        setUpcomingTrainings(response.data);
      } catch (error) {
        console.error('Error fetching upcoming trainings:', error);
      }
    };

    fetchUpcomingTrainings();
  }, []);

  const handleViewDetails = (trainingId) => {
    console.log(trainingId);
    ///training?trainingId=10
    navigate('/trainingdetails',{ state: {trainingId} });
  };
  // const handleViewDetails = (trainingId) => {
  //   navigate(`/training-details/${trainingId}`);
  // };

  return (
    <div className="upcoming-training-page">
      <h2>Upcoming Trainings</h2>
      <div className="training-list">
        {upcomingTrainings.map((training) => (
          <div className="training-item" key={training.trainingId}>
            <h3>{training.topic}</h3>
            <p><strong>Location:</strong> {training.location}</p>
            <p><strong>Duration:</strong> {training.startDate} to {training.endDate}</p>
            <p><strong>Trainer:</strong> {training.trainer.name}</p>
            <button onClick={() => handleViewDetails(training.trainingId)}>View Details</button>
          </div>
        ))}
      </div>
      <Link to="/" className="back-link">Go Back to Home</Link>
    </div>
  );
};

export default UpcomingTrainingTrainer;

