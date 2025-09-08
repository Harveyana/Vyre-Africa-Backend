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

    async send(token:string,number:string)
    {
        const data = {
            api_key: config.termiiLiveKey,
            to: number,
            from:'Vyre Africa',
            sms:`${token}`,
            type:'plain',
            channel:'whatsapp', //It is either dnd, whatsapp, or generic

        }

        return await termiiAxios.post('/api/sms/send', data)
    }

    async sendBulk(data:{})
    {
        // return await termiiAxios.get('https://v3.api.termii.com/api/sender-id?api_key=TLYnfZSxEmUgkZDHBRNosLsKyWLezfNJHkGJJcQAVxxJbWZCuuVOoELPsKIFSL')

        return await termiiAxios.post('/api/sms/send/bulk', data)
    }
}

export default new SMSService()