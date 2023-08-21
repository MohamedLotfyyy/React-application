import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import './Payement.css';
import './Success.css';

const CARD_OPTIONS = {
  style: {
    base: {
      color: '#000',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#dc3545',
      iconColor: '#dc3545',
    },
  },
};

export default function Payment() {
  const [success, setSuccess] = useState(false);
  // obtain an instance of the Stripe object
  // perform various actions, such as creating payment methods, creating tokens, handling payments etc
  const stripe = useStripe();
  // which allows you to interact with stripe elements
  //  such as CardEelement, CardNumberElement etc.
  const elements = useElements();


  // asynchronous function that handles button submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let i = 1;

    // creating the elements we need to fill for the payement process(card number, cvc etc)
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    // creating payement method while using async wait so that we don't execture next inst untli we finish this one
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card', // type of payement
      card: cardNumberElement, // the input that holds the card details to complete payement
    });

    if (!error) { // if we don't encounter an error creating the payement method
      try {
        const { id } = paymentMethod; // get the id from the payement method
        // send amount and id to server
        // await: don't go anywhere until we finish this post request
        const response = await axios.post('http://localhost:4000/payment', {
          amount: 1000, // 10 dollars (Note the comma after 1000)
          id,
        });
        // if we get a success response, set success state to true which means that payement is succesfull
        if (response.data.success) {
          console.log('Successful payment');
          setSuccess(true);
        }
      } catch (error) { // catch if any error happens and print it
        console.log('Error: ', error);
      }
    } else {
      // If there was an error initially creating the payment method
      console.log(error.message);
    }
  };
  const navigate = useNavigate();
  return (
    <>
      {!success ? (
        <div className="payment-container"> {/* Payment component container */}
          <form onSubmit={handleSubmit}>
            <fieldset className="FormGroup">
              {/* Your form content */}
              <h1>Enter your payment details</h1>
              <div className="FormRow">
                <label>
                  Card Number
                  <div className="CardElementContainer">
                    <CardNumberElement options={CARD_OPTIONS} />
                  </div>
                </label>
              </div>
              <div className="FormRow">
                <label>
                  Expiry Date
                  <div className="CardElementContainer">
                    <CardExpiryElement options={CARD_OPTIONS} />
                  </div>
                </label>
              </div>
              <div className="FormRow">
                <label>
                  Security Number
                  <div className="CardElementContainer">
                    <CardCvcElement options={CARD_OPTIONS} />
                  </div>
                </label>
              </div>
            </fieldset>
            <button>Pay</button>
          </form>
        </div>
      ) : (
        <div className = "success_container">
            <h2 className = "text_press">Payment Successful</h2>
            <h3 >Press the button below to start uploading the necessary files</h3>
            <button id = "click_btn" onClick = {() => navigate('dropzone')}>Click me</button>
        </div>
      )}
    </>
  );
}