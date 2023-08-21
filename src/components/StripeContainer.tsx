import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import Payement from './Payement.tsx';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';



const PUBLIC_KEY = "pk_test_51NUoeHKMcBNCYbUKYPYILpx7fy7iYMPTHRRYCPUbOZhKgCxBkMlQx2feaMV9NTwFt1z053QJBs5wMr8McVahGRgm00OUGjE2GZ"
const stripeTestPromise = loadStripe(PUBLIC_KEY)

function StripeContainer() {
  return (
    <Elements stripe={stripeTestPromise}>
			<Payement />
		</Elements>
  )
}

export default StripeContainer;
