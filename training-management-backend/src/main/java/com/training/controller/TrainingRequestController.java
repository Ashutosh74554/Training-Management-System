package com.training.controller;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.training.model.TrainingRequest;
import com.training.model.User;
import com.training.services.TrainingService;
import com.training.services.UserService;
@CrossOrigin(
	    origins = {
	        "http://localhost:3000"
	        },
	    methods = {
	                RequestMethod.OPTIONS,
	                RequestMethod.GET,
	                RequestMethod.PUT,
	                RequestMethod.DELETE,
	                RequestMethod.POST
	})
@RestController
public class TrainingRequestController {
	@Autowired
	TrainingService trainingService;
	@Autowired
	UserService userService;

	@PostMapping("/request-training")
	public ResponseEntity<TrainingRequest> requestNewTraining(@RequestParam int userId, @RequestParam String topic, 
			@RequestParam String description){
		
		User user = userService.findById(userId);
		if(user == null)
			throw new UserNotFoundException("User not found with the given user id");
		
		try {
			TrainingRequest request = new TrainingRequest(0, user, topic, description, "Pending", Date.valueOf(LocalDate.now()));
			TrainingRequest trainingRequest = trainingService.createTrainingRequest(request);
			return ResponseEntity.ok(trainingRequest);
		}catch(Exception e) {
			throw new InvalidRequestException("Request can't be raised! Kindly check your input data.");
		}
	}

	@GetMapping("/request/{requestId}")
	public ResponseEntity<TrainingRequest> getTrainingRequest(@RequestParam int userId, @RequestParam int requestId){
		TrainingRequest request = trainingService.findRequestById(requestId);
		User user = userService.findById(userId);

		if(user == null)
			throw new UserNotFoundException("User not found with the given user id");
		if(request == null)
			throw new ApplicationNotFoundException("Training request with given id is not available");
		if(request.getUser() != user && !user.getUserType().equalsIgnoreCase("admin"))
			throw new InvalidRequestException("You don't have permissions to send this request");

		return ResponseEntity.ok(request);
	}

	@GetMapping("/request/all")
	public ResponseEntity<List<TrainingRequest>> getAllRequests(@RequestParam int userId){
		User user = userService.findById(userId);
		if(user == null)
			throw new UserNotFoundException("User not found with the given user id");
		if(!user.getUserType().equalsIgnoreCase("admin"))
			throw new InvalidRequestException("You don't have permissions to send this request");

		List<TrainingRequest> requests = trainingService.getTrainingRequests();
		return ResponseEntity.ok(requests);
	}

	@PutMapping("/update-training")
	public ResponseEntity<TrainingRequest> updateTraining(@RequestParam int userId, @RequestParam int requestId,
			@RequestParam String status) throws Exception{
		User user = userService.findById(userId);
		if(user == null)
			throw new UserNotFoundException("User not found with the given user id");
		if(!user.getUserType().equalsIgnoreCase("admin"))
			throw new InvalidRequestException("You don't have permissions to send this request");

		TrainingRequest request = trainingService.findRequestById(requestId);
		if(request == null)
			throw new ApplicationNotFoundException("Training request with given id is not available");
		if(!request.getStatus().equalsIgnoreCase("pending"))
			throw new InvalidRequestException("You can't change the status of the request now!");

		request.setStatus(status);
		try {
			TrainingRequest updatedRequest = trainingService.updateTrainingRequest(request);
			return ResponseEntity.ok(updatedRequest);
		}catch(Exception e) {
			throw new Exception("Some error occurred: " + e.getMessage());
		}
	}
}