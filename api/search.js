"gemma2-9b-it"

const axios  = require("axios")

const search = async (msg) => {
    const data = await axios.post("https://api.codeltix.com/api/v1/ai/ws/?model=gemma2-9b-it&prompt=" + encodeURIComponent(msg))

    return data.data?.message || null;
}

module.exports = search