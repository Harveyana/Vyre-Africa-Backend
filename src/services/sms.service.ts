import axios from "axios";
import config from "../config/env.config";


const termiiAxios = axios.create({
    baseURL: config.termiiBaseUrl,
});

class SMSService{
    provider:string;

    constructor() {
        this.provider = 'termii'
    }

    async send(data:{})
    {
        return await termiiAxios.post('/api/sms/send', data)
    }

    async sendBulk(data:{})
    {
        // return await termiiAxios.get('https://v3.api.termii.com/api/sender-id?api_key=TLYnfZSxEmUgkZDHBRNosLsKyWLezfNJHkGJJcQAVxxJbWZCuuVOoELPsKIFSL')

        return await termiiAxios.post('/api/sms/send/bulk', data)
    }
}

export default new SMSService()