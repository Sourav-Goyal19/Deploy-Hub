"use client";

import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york-v4/ui/form";
import { setCookies } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/registry/new-york-v4/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  type FormValues = z.infer<typeof formSchema>;

  const loginMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await axiosInstance.post("/api/auth/login", data);
      return res;
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      loginMutation.mutate(data, {
        onSuccess(res, variables, context) {
          navigate({
            to: "/auth/sign-in",
          });
          console.log(res.data);
          setCookies(res.data.accessToken, res.data.refreshToken);

          toast.success(res.data.message || "Logged In Successfully");
        },
        onError(err, variables, context) {
          console.error("LOGIN:", err);
          toast.error(err.message || "Something went wrong");
        },
      });
    } catch (error) {
    } finally {
    }
  };

  return (
    <div className="border border-primary rounded-lg p-7 mt-5 max-w-[550px] mx-3 shadow-xl w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading || loginMutation.isPending}
                    placeholder="Enter Your Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading || loginMutation.isPending}
                    type="password"
                    placeholder="Enter Your Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading || loginMutation.isPending}
            className="w-full"
          >
            Sign In
          </Button>
        </form>
      </Form>
      <div className="mt-4">
        <p className="text-center text-white">
          New Here?{" "}
          <Link to="/auth/sign-up" className="font-medium underline">
            Create An Account
          </Link>{" "}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
