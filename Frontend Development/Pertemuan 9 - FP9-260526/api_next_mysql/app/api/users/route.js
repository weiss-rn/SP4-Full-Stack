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
            message: "Error fetching users: " + error.message
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return Response.json({
                success: false,
                message: "Name and email are required"
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
                message: "ID, name, and email are required"
            }, { status: 400 });
        }

        const result = await updateUser(id, name, email);
        return Response.json(result, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return Response.json({
            success: false,
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
                message: "ID is required"
            }, { status: 400 });
        }

        const result = await deleteUser(id);
        return Response.json(result, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error deleting user: " + error.message
        }, { status: 500 });
    }
}
