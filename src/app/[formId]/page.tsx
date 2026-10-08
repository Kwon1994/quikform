"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FormField } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function FormFillPageContent() {
  const params = useParams();
  const formId = params.formId as string;

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError("Form not found. Is the link correct?");
          setLoading(false);
        } else {
          setTitle(data.title);
          setFields(data.fields || []);
          setLoading(false);
        }
      });
  }, [formId]);

  function handleAnswer(fieldId: string, value: string) {
    setAnswers({ ...answers, [fieldId]: value });
  }

  async function handleSubmit() {
    for (const field of fields) {
      if (
        field.required &&
        (!answers[field.id] || answers[field.id].trim() === "")
      ) {
        setError(`"${field.label}" is required.`);
        return;
      }
    }

    const { error: insertError } = await supabase
      .from("responses")
      .insert({ form_id: formId, answers });

    if (insertError) {
      setError("Failed to submit: " + insertError.message);
    } else {
      setSubmitted(true);
      setError("");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading form...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="text-5xl">✓</div>
        <h1 className="text-2xl font-bold text-slate-900">Thank you!</h1>
        <p className="text-slate-500">
          Your response has been recorded.
        </p>
      </div>
    );
  }

  if (error && fields.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <h1 className="text-xl font-bold text-red-600">Form Not Found</h1>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {title}
        </h1>

        <div className="space-y-5">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardContent className="pt-4 space-y-2">
                <Label className="text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>

                {field.type === "text" ||
                field.type === "email" ||
                field.type === "number" ? (
                  <Input
                    type={
                      field.type === "email"
                        ? "email"
                        : field.type === "number"
                          ? "number"
                          : "text"
                    }
                    value={answers[field.id] || ""}
                    onChange={(e) =>
                      handleAnswer(field.id, e.target.value)
                    }
                    placeholder={field.label}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    value={answers[field.id] || ""}
                    onChange={(e) =>
                      handleAnswer(field.id, e.target.value)
                    }
                    rows={4}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder={field.label}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={answers[field.id] || ""}
                    onChange={(e) =>
                      handleAnswer(field.id, e.target.value)
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select an option...</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="space-y-2">
                    {field.options.map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(answers[field.id] || "")
                            .split(",")
                            .includes(opt)}
                          onChange={(e) => {
                            const current = (answers[field.id] || "")
                              .split(",")
                              .filter(Boolean);

                            if (e.target.checked) {
                              handleAnswer(
                                field.id,
                                [...current, opt].join(",")
                              );
                            } else {
                              handleAnswer(
                                field.id,
                                current
                                  .filter((c) => c !== opt)
                                  .join(",")
                              );
                            }
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && fields.length > 0 && (
          <p className="text-sm text-red-600 mt-4">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 py-3"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default function FormFillPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-500">Loading form...</p>
        </div>
      }
    >
      <FormFillPageContent />
    </Suspense>
  );
}