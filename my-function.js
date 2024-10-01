export const handler = async (event) => {
    const keyword = event.queryStringParameters.keyword;
    const name = "Gayathri"; 
    return {
        statusCode: 200,
        body: JSON.stringify(`${name} says ${keyword}`)
    };
};
