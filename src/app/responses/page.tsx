"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FormField } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ResponsesPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [activeFormId, setActiveFormId] = useState("");
  const [activeFormTitle, setActiveFormTitle] = useState("");
  const [activeFields, setActiveFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all forms when page opens
  useEffect(() => {
    supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data) setForms(data);
        setLoading(false);
      });
  }, []);

  // When you click a form, load its responses
  function viewForm(form: any) {
    setActiveFormId(form.id);
    setActiveFormTitle(form.title);
    setActiveFields(form.fields || []);

    supabase
      .from("responses")
      .select("*")
      .eq("form_id", form.id)
      .order("submitted_at", { ascending: false })
      .then(({ data, error }) => {
        if (data) setResponses(data);
      });
  }

  // Back to the list
  function goBack() {
    setActiveFormId("");
    setActiveFormTitle("");
    setActiveFields([]);
    setResponses([]);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // VIEW: Form list (pick which form's responses to see)
  if (!activeFormId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Responses</h1>
          <p className="text-sm text-slate-500 mb-6">
            Pick a form to see its answers.
          </p>

          {forms.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-slate-400">
                  No forms yet. Build one first at{" "}
                  <a href="/builder" className="text-indigo-600 hover:underline">
                    /builder
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {forms.map((form: any) => (
                <Card
                  key={form.id}
                  className="cursor-pointer hover:ring-2 hover:ring-indigo-200"
                  onClick={() => viewForm(form)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{form.title}</p>
                        <p className="text-xs text-slate-400">
                          {form.fields.length} question
                          {form.fields.length !== 1 ? "s" : ""} ·{" "}
                          {new Date(form.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm text-indigo-600">View →</span>
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

  // VIEW: Responses for the selected form
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{activeFormTitle}</h1>
            <p className="text-sm text-slate-500">
              {responses.length} response{responses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={goBack}>
            ← All Forms
          </Button>
        </div>

        {responses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-slate-400">
                No responses yet. Share your form link to collect answers.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {responses.map((resp: any, idx: number) => (
              <Card key={resp.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>
                      Response #{responses.length - idx}
                    </span>
                    <span className="text-xs font-normal text-slate-400">
                      {new Date(resp.submitted_at).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeFields.map((field) => (
                    <div key={field.id} className="flex gap-2 text-sm">
                      <span className="font-medium text-slate-500 w-48 shrink-0">
                        {field.label}:
                      </span>
                      <span className="text-slate-900">
                        {resp.answers?.[field.id] || <em className="text-slate-300">—</em>}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}