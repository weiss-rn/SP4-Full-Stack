import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";

export async function GET() {
    try {
        const result = await getUsers();
        return Response.json(result, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return Response.json({
            success: false,
            data: [],
            message: "Database error: " + error.message
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return Response.json({
                success: false,
                data: null,
                message: "Name and email are required"
            }, { status: 400 });
        }

        if (!email.includes('@')) {
            return Response.json({
                success: false,
                data: null,
                message: "Invalid email format"
            }, { status: 400 });
        }

        const result = await createUser(name, email);
        return Response.json(result, {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return Response.json({
            success: false,
            data: null,
            message: "Error creating user: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id, name, email } = await req.json();

        if (!id || !name || !email) {
            return Response.json({
                success: false,
                data: null,
                message: "ID, name, and email are required"
            }, { status: 400 });
        }

        const result = await updateUser(id, name, email);
        if (!result.success) {
            return Response.json(result, { status: 404 });
        }
        return Response.json(result, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return Response.json({
            success: false,
            data: null,
            message: "Error updating user: " + error.message
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return Response.json({
                success: false,
                data: null,
                message: "ID is required"
            }, { status: 400 });
        }

        const result = await deleteUser(id);
        if (!result.success) {
            return Response.json(result, { status: 404 });
        }
        return Response.json(result, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return Response.json({
            success: false,
            data: null,
            message: "Error deleting user: " + error.message
        }, { status: 500 });
    }
}
