// 

import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../../utils/api";
import UserProfileBubble from '../common/profilePage/userProfileBubble';
import "./userDashboard.css";

const TraineeManagerDashboard = () => {
  const [ongoingTrainings, setOngoingTrainings] = useState([]);
  const [pastTrainings, setPastTrainings] = useState([]);
  const [availableTrainings, setAvailableTrainings] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNewTrainingForm, setShowNewTrainingForm] = useState(false);
  const [newTrainingDescription, setNewTrainingDescription] = useState("");
  const textareaRef = useRef(null);
  const [openSection, setOpenSection] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const [newTrainingTopic, setNewTrainingTopic] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, userType } = location.state || {};

  useEffect(() => {
    if (userType === "manager") {
      loadPendingApprovals();
    }
  }, [userType]);

  const loadOngoingTrainings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/ongoing-trainings`, {
        withCredentials: true,
      });
      setOngoingTrainings(response.data);
      setOpenSection("ongoing");
    } catch (error) {
      console.error("Error fetching ongoing trainings:", error);
    }
  };

  const loadPastTrainings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/past-trainings`, {
        withCredentials: true,
      });
      setPastTrainings(response.data);
      setOpenSection("past");
    } catch (error) {
      console.error("Error fetching past trainings:", error);
    }
  };

  const loadAvailableTrainings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/training/upcoming`, {
        withCredentials: true,
      });
      setAvailableTrainings(response.data);
      setOpenSection("available");
    } catch (error) {
      console.error("Error fetching available trainings:", error);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/manager/pending-approvals`, {
        withCredentials: true,
      });
      setPendingApprovals(response.data);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setOpenSection("requested");
  };

  const handleApproval = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:8084/update-application`,
        null,
        {
          params: { applicationId, status },
          withCredentials: true,
        }
      );
      setPendingApprovals((prev) => prev.filter((req) => req.applyId !== applicationId));
    } catch (error) {
      console.error(`Error updating approval status for request ${applicationId}:`, error);
    }
  };

  const handleApplyClick = (trainingId) => {
    setSelectedTrainingId(trainingId);
    setShowConfirmModal(true);
  };

  const confirmApply = async () => {
    if (!selectedTrainingId) return;

    try {
      await axios.post(
        `${BASE_URL}/apply/${selectedTrainingId}?trainingId=${selectedTrainingId}`,
        {},
        { withCredentials: true }
      );
      alert("Applied successfully!");
    } catch (error) {
      console.error(`Error applying for training ${selectedTrainingId}:`, error);
      alert("Failed to apply for training. Please try again.");
    } finally {
      setShowConfirmModal(false);
      setSelectedTrainingId(null);
    }
  };

  const cancelApply = () => {
    setShowConfirmModal(false);
    setSelectedTrainingId(null);
  };

  const handleNewTrainingRequestClick = () => {
    setShowNewTrainingForm(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleViewDetails = (trainingId) => {
    navigate('/trainingdetails', { state: { trainingId } });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        "http://localhost:8084/request-training",
        null,
        {
          params: {
            topic: newTrainingTopic,
            description: newTrainingDescription,
          },
          withCredentials: true,
        }
      );

      setNewTrainingTopic("");
      setNewTrainingDescription("");
      setShowNewTrainingForm(false);
      alert("Training request submitted successfully!");
    } catch (error) {
      console.error("Error submitting training request:", error);
      alert("Failed to submit training request. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>User Dashboard</h2>
        <UserProfileBubble />
      </header>

      {/* Ongoing Trainings Section */}
      <section className="training-section">
        <button onClick={loadOngoingTrainings} className="primary">Ongoing Trainings</button>
        {openSection === "ongoing" && (
          <ul>
            {ongoingTrainings.slice(0, 3).length > 0 ? (
              ongoingTrainings.map((training) => (
                <li key={training.trainingId}>
                  <strong>{training.topic}</strong> - {training.location} from{" "}
                  {training.startDate} to {training.endDate}
                  <button onClick={() => handleViewDetails(training.trainingId)} className="view-details-button">View Details</button>
                </li>
              ))
            ) : (
              <p>No ongoing trainings.</p>
            )}
          </ul>
        )}
        {ongoingTrainings.length > 3 && (
          <Link to="/user/ongoing" className="see-more">...see more</Link>
        )}
      </section>

      {/* Past Trainings Section */}
      <section className="training-section">
        <button onClick={loadPastTrainings} className="secondary">Past Trainings</button>
        {openSection === "past" && (
          <ul>
            {pastTrainings.slice(0, 3).length > 0 ? (
              pastTrainings.map((training) => (
                <li key={training.trainingId}>
                  <strong>{training.topic}</strong> - {training.location} (Ended on {training.endDate})
                  <button onClick={() => handleViewDetails(training.trainingId)} className="view-details-button">View Details</button>
                </li>
              ))
            ) : (
              <p>No past trainings.</p>
            )}
          </ul>
        )}
        {pastTrainings.length > 3 && (
          <Link to="/user/past" className="see-more">...see more</Link>
        )}
      </section>

      {/* Available Trainings Section */}
      <section className="training-apply">
        <button onClick={loadAvailableTrainings} className="primary">Available Trainings</button>
        {openSection === "available" && (
          <ul>
            {availableTrainings.slice(0, 3).length > 0 ? (
              availableTrainings.map((training) => (
                <li key={training.trainingId}>
                  <strong>{training.topic}</strong> - {training.location} (Starts on {training.startDate})
                  <button onClick={() => handleViewDetails(training.trainingId)} className="view-details-button">View Details</button>
                  <button onClick={() => handleApplyClick(training.trainingId)} className="view-details-button" style={{ backgroundColor: "green" }}>Apply</button>
                </li>
              ))
            ) : (
              <p>No available trainings.</p>
            )}
          </ul>
        )}
        {availableTrainings.length > 3 && (
          <Link to="/user/upcoming" className="see-more">...see more</Link>
        )}
      </section>

      {/* Request New Training Section */}
      <section className="training-section">
        <button onClick={handleNewTrainingRequestClick} className="neutral">Request New Training</button>
        {showNewTrainingForm && (
          <form onSubmit={handleFormSubmit} className="new-training-form">
            <label htmlFor="topic">Training Topic</label>
            <input
              type="text"
              id="topic"
              name="topic"
              placeholder="Enter training topic"
              value={newTrainingTopic}
              onChange={(e) => setNewTrainingTopic(e.target.value)}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter training description"
              ref={textareaRef}
              value={newTrainingDescription}
              onChange={(e) => setNewTrainingDescription(e.target.value)}
              required
            />

            <button type="submit" className="primary">Submit</button>
          </form>
        )}
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to apply for this training?</p>
            <button onClick={confirmApply} className="confirm-button">Yes</button>
            <button onClick={cancelApply} className="cancel-button">No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeManagerDashboard;
