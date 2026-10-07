"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FieldType, FormField } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "select", label: "Dropdown" },
  { value: "number", label: "Number" },
  { value: "checkbox", label: "Checkbox" },
];

export default function BuilderPage() {
  const [title, setTitle] = useState("My Form");
  const [fields, setFields] = useState<FormField[]>([]);
  const [savedForms, setSavedForms] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");  // Load saved forms from the database when the page opens
  useEffect(() => {
    supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSavedForms(data || []);
      });
  }, []);

  // Add a new question to the builder
  function addField(type: FieldType) {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: "New question",
      required: false,
      options: type === "select" || type === "checkbox" ? ["Option 1", "Option 2"] : [],
    };
    setFields([...fields, newField]);
  }

  // Remove a question
  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  // Change a question's label, type, or required status
  function updateField(id: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  // Save the form to the database
  async function saveForm() {
    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("forms")
      .insert({ title, fields })
      .select()
      .single();

    if (error) {
      setMessage("ERROR: " + error.message);
    } else {
      setTitle("My Form");
      setFields([]);
      const { data: refreshed } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false });
      setSavedForms(refreshed || []);
      setMessage("Form saved successfully.");
    }

    setSaving(false);
  }
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Build a Form</h1>
        <p className="text-sm text-slate-500 mb-6">Add questions, set a title, hit Save.</p>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Form Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Feedback"
            />
          </CardContent>
        </Card>

        {fields.length > 0 && (
          <div className="space-y-3 mb-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-500">
                      Question {index + 1}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      X Remove
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="e.g. What is your name?"
                      className="flex-1"
                    />
                  </div>

                  <div className="flex gap-3 items-center">
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as FieldType,
                          options:
                            e.target.value === "select" || e.target.value === "checkbox"
                              ? field.options.length > 0
                                ? field.options
                                : ["Option 1", "Option 2"]
                              : [],
                        })
                      }
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white"
                    >
                      {FIELD_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1.5 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                  </div>

                  {(field.type === "select" || field.type === "checkbox") && (
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">
                        Options (one per line)
                      </Label>
                      <textarea
                        value={field.options.join("\n")}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value.split("\n").filter((o) => o.trim() !== ""),
                          })
                        }
                        rows={3}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder={"Option A\nOption B\nOption C"}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Add a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPES.map((ft) => (
                <Button
                  key={ft.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addField(ft.value)}
                >
                  + {ft.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={saveForm}
            disabled={saving || fields.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? "Saving..." : "Save Form"}
          </Button>
          {message && (
            <span
              className={`text-sm ${
                message.startsWith("ERROR") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </span>
          )}
        </div>

        <hr className="border-slate-200 mb-6" />
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Your Forms ({savedForms.length})
        </h2>

        {savedForms.length === 0 ? (
          <p className="text-sm text-slate-400">No forms yet. Build one above!</p>
        ) : (
          <div className="space-y-2">
            {savedForms.map((form: any) => (
              <Card key={form.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{form.title}</p>
                      <p className="text-xs text-slate-400">
                        {form.fields.length} question{form.fields.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(form.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={`/${form.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}