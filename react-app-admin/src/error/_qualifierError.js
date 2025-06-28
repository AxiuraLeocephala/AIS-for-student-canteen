const QualifierError = (error) => {
    console.log(error)
    if (error.response){
        throw new Response(error.response.data.err, {status: error.response.status});
    } else if (error.message === "Network Error") {
        throw new Response('Server is sleeping', {status: 503});
    } else {
        throw new Response('Unknown error', {status: 500});
    }
}

export default QualifierError;