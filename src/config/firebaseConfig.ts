import admin from "firebase-admin";
import serviceAccountKey from "../../serviceAccountKey.json";

let adminBase: any;

export const initializeAdmin = () => {
	try {
		adminBase = admin.initializeApp({
			credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
		});
		return adminBase;
	} catch (error) {
		console.log(error);
	}
};

export { adminBase };
