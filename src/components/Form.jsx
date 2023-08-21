import React, { useState } from 'react';
import axios from 'axios';
import './Form.css';
import {useNavigate} from 'react-router-dom'

const MyForm = () => {
    // created a new state containing the form data initially equal to a dict with the values equal to empty string
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    complain: ''
  });

  // function that will be triggered when a change occurs in one of the input fields
  // const { name, value } = e.target: destructuring the name and value from the event target
  // name corresponds to name of the input field(name, email, phone, complain) 
  // value corresponds to the value which corresponds with the respective input
  const handleChange = (e) => {
    const { name, value } = e.target;
    // keep the previous just change the value of whatever input which changed
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };
  // arrow function that takes as an argument the triggered event to handle submit 
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form submission actions here, such as validation, saving data, etc.
    console.log(formData);
    axios.post("http://localhost:4000/form", formData)
  };
  // using the useNavigate function from the react router to handle routing throught the website.
  const navigate = useNavigate()
  return (
      <div className = "main_container">
        <form onSubmit={handleSubmit} className = "form" autoComplete = "off">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />

            <label htmlFor="phone">Phone:</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />

            <label htmlFor="complain">Complain:</label>
            <textarea id="complain" name="complain" value={formData.complain} onChange={handleChange} />

            <button type="submit" id = "submit_button" onClick = {() => navigate('payement')}>Submit</button>
        </form>
    </div>
  );
};

export default MyForm;
