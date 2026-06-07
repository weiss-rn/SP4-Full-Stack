import { getUserById } from "@/lib/api";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const result = await getUserById(id);
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
            message: "Error fetching user: " + error.message
        }, { status: 500 });
    }
}
