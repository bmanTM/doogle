import axios from 'axios'

const APIPaths = {
    DOG: `http://doogle-env.eba-ugdmui76.us-east-2.elasticbeanstalk.com/api/redirect/dog`,
    BORED: `http://doogle-env.eba-ugdmui76.us-east-2.elasticbeanstalk.com/api/activity/random`,
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
