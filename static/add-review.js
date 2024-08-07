document.addEventListener('DOMContentLoaded', () => {
    const token = checkAuthentication();
    const placeId = getPlaceIdFromURL();

    if (!placeId) {
        console.error('Place ID not found in URL');
        return;
    }

    if (token) {
        setupReviewForm(token, placeId);
    }
});

function checkAuthentication() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    return token;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('placeId');
}

function setupReviewForm(token, placeId) {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) {
        console.error('Review form not found');
        return;
    }

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const reviewText = document.getElementById('review-text').value;
        await submitReview(token, placeId, reviewText);
    });
}

async function submitReview(token, placeId, reviewText) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ placeId, reviewText })
        });

        handleResponse(response);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit review');
    }
}

function handleResponse(response) {
    if (response.ok) {
        alert('Review submitted successfully!');
        document.getElementById('review-form').reset();
    } else {
        alert('Failed to submit review: ' + response.statusText);
    }
}
