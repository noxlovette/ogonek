import type { ClientInit, Handle } from "@sveltejs/kit";
import { setUser } from '$lib/stores';

export const init: ClientInit = async () => {
    let user = localStorage.getItem("user");

    if (user) {
        setUser(JSON.parse(user));
    }
};

