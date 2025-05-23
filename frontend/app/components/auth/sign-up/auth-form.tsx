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

type variant = "signup" | "verify";

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signupSchema = z.object({
    name: z.string().min(3).trim(),
    email: z.string().email().trim(),
    password: z
      .string()
      .min(6, "Password must contain at least 6 character(s)")
      .trim(),
  });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      const res = await axiosInstance.post("/api/auth/signup", data);
      return res;
    },
  });

  const signupForm = useForm<SignupFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const onSignupSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    // setIsLoading(true);
    try {
      signupMutation.mutate(data, {
        onSuccess(res, variables, context) {
          navigate({
            to: "/auth/sign-in",
          });
          toast.success(res.data.message || "SignUp Successful");
        },
        onError(err, variables, context) {
          console.error("SignUp:", err);
          toast.error(err.message || "Something happened wrong");
        },
      });
    } catch (error) {
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className="border border-primary rounded-lg p-7 mt-5 max-w-[550px] mx-3 shadow-xl w-full">
      <Form {...signupForm}>
        <form
          onSubmit={signupForm.handleSubmit(onSignupSubmit)}
          className="space-y-5"
        >
          <FormField
            control={signupForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading || signupMutation.isPending}
                    placeholder="Enter Your Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading || signupMutation.isPending}
                    placeholder="Enter Your Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={signupForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading || signupMutation.isPending}
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
            disabled={isLoading || signupMutation.isPending}
            className="w-full"
          >
            Sign Up
          </Button>
        </form>
      </Form>
      <div className="mt-4">
        <p className="text-center text-white">
          Already Have An Account?{" "}
          <Link to="/auth/sign-in" className="font-medium underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
