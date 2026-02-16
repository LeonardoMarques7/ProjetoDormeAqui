import React, { useContext, useEffect } from "react";
import axios from "axios";
import { MercadoPagoContext } from "./MercadoPagoProvider";

export default function PaymentBrick({
	amount,
	reservationId,
	onSuccess,
	onError,
}) {
	const mp = useContext(MercadoPagoContext);

	useEffect(() => {
		if (!mp) return;

		const settings = {
			initialization: {
				amount: Number(amount),
			},

			callbacks: {
				onReady: () => {},

				onError: (err) => {
					console.error("PaymentBrick error", err);
					onError && onError(err && err.message ? err.message : JSON.stringify(err));
				},

				onSubmit: async (formData) => {
					try {
						const payload = {
							token: formData.token,
							payment_method_id: formData.payment_method_id,
							issuer_id: formData.issuer_id,
							installments: formData.installments,
							amount,
							reservationId,
							payer: { email: formData.payer?.email },
						};

						const res = await axios.post("/payments/create", payload);
						onSuccess && onSuccess(res.data);
					} catch (err) {
						onError && onError(err && err.message ? err.message : JSON.stringify(err));
					}
				},
			},
		};

		const bricksBuilder = mp.bricks();
		let controller;

		// Build a permissive initialization object to satisfy different server expectations
		const initialization = Object.assign({}, (settings.initialization || {}), {
			payment_method: 'card',
			payment_method_id: 'card',
			payment_methods: ['card'],
			payment_method_ids: ['card'],
			payment_type: 'credit_card',
			paymentType: 'credit_card',
			payment_method_types: ['credit_card'],
			payer: { email: (window?.__TRANSPARENT_BOOKING_DATA__?.email) || 'no-reply@example.com' }
		});

		// If the backend returned a preference/product id expose common aliases to the SDK initialization
		const prefId = window?.__TRANSPARENT_BOOKING_DATA__?.preferenceId || window?.__TRANSPARENT_BOOKING_DATA__?.preference_id || window?.__TRANSPARENT_BOOKING_DATA__?.pref_id || window?.__TRANSPARENT_BOOKING_DATA__?.product_id || null;
		if (prefId) {
			initialization.preference_id = prefId;
			initialization.preferenceId = prefId;
			initialization.pref_id = prefId;
			initialization.product_id = initialization.product_id || prefId;
		}

		bricksBuilder.create("payment", "paymentBrick_container", {
			initialization: {
				amount: totalPrice,
				preferenceId: preferenceId,
			},
		});


		return () => controller?.unmount && controller.unmount();
	}, [mp, amount, reservationId, onSuccess, onError]);

	return <div id="payment-brick-container" />;
}
