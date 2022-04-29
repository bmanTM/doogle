import axios from 'axios'

const APIPaths = {
    DOG: `http://localhost:${process.env.PORT}/api/redirect/dog`,
    BORED: `http://localhost:${process.env.PORT}/api/activity/random`,
}

async function fetchData(apiPath, query) {
    const result = await axios.get(`${apiPath.trim(`/`)+`/`+query.trim('/')}`)
    .then((response) => {
        return response.data;
    })
    .catch(error => {
        throw error;
    });

    return result;
}

export { fetchData, APIPaths };
