document.addEventListener('DOMContentLoaded', () => {
    const placeId = getPlaceIdFromURL();
    const isAuthenticated = checkAuthentication();

    if (placeId) {
        fetchPlaceDetails(placeId, isAuthenticated);
    } else {
        console.error('Place ID not found in URL');
    }

    const addReviewSection = document.getElementById('add-review');
    if (!isAuthenticated) {
        addReviewSection.style.display = 'none';
    } else {
        addReviewSection.style.display = 'block';
    }
});

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('placeId');
}

async function fetchPlaceDetails(placeId, isAuthenticated) {
    try {
        const headers = isAuthenticated ? { 'Authorization': `Bearer ${getCookie('token')}` } : {};
        const response = await fetch(`http://127.0.0.1:5000/api/places/${placeId}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            console.error('Failed to fetch place details:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
    placeDetails.innerHTML = ''; //

    const nameElement = document.getElementById('place-name');
    nameElement.textContent = place.name;

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = place.description;

    const locationElement = document.createElement('p');
    locationElement.textContent = `Location: ${place.location}`;

    placeDetails.appendChild(descriptionElement);
    placeDetails.appendChild(locationElement);

    if (place.images && place.images.length > 0) {
        const imagesContainer = document.createElement('div');
        place.images.forEach(imageUrl => {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imagesContainer.appendChild(imgElement);
        });
        placeDetails.appendChild(imagesContainer);
    }
}
