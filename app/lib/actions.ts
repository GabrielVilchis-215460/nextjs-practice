"use server";
import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount grater than $0." }), // especficamente, la cantidad va cambiar con el coerce de un string, a un numero, mientras que tambien valida su tipo
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
  /*
- CustomerID - Zod ya sabe que va a arrojar un error si el campo cliente esta vacio, y este espera un tipo string. Solo tendra un mensaje informativo para el cliente.
- amount - Desde que se esta conviertendo de un string, a un numero, por defecto ahora estará en 0 si el string esta vacio. Ahora le indicaremos a Zod que siempre se deberá ingresar una cantidad mayor a 0 con la funcion gt()
- status: Zod ya sabe que va a arrojar un error si el campo de estatus esta vacio, este espera un "pending" o un "paid". Asi que tambien tendra un mensaje informativo para el usuario
*/
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function createInvoice(prevState: State, formData: FormData) {
  /*
  prevState contiene el estado pasado desde el hook de useActionSate
  */
  // Validar el formulario usando Zod
  const validatedFields = CreateInvoice.safeParse({
    /*
    safeParse() va a devoler un objeto que contiene, ya sea el campo success o error.
    */
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  // Preparar datos para insertar en la bd
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // buena practica: guardar valores monetarios en centavos
  const date = new Date().toISOString().split("T")[0]; // crear una nueva fecha en formato "YYYY-MM-DD"
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error(error);
    throw new Error("Error de base de datos: Error al crear una factura.");
  }
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
  // Test it out:
  //console.log(rawFormData);
  /*
  Output:  GET /dashboard/invoices/create 200 in 1363ms (compile: 9ms, render: 1354ms)
{
  customerId: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
  amount: '69',
  status: 'pending'
}
  */
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error(error);
    throw new Error("Error de base de datos: Error al actualizar una factura.");
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
