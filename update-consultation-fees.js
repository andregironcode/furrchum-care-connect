const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lrcsczyxdjhrfycxnjxi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyY3Njenl4ZGpocmZ5Y3huanhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MjE1OCwiZXhwIjoyMDYzNTY4MTU4fQ.zJv03B-B8zDxtikw7iKe3MbXIpwcHrriROFaCL6k9QE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateConsultationFees() {
  try {
    console.log('Starting consultation fee update...');
    
    // Get all vet profiles with their current consultation fees
    const { data: vets, error: fetchError } = await supabase
      .from('vet_profiles')
      .select('id, first_name, last_name, consultation_fee')
      .not('consultation_fee', 'is', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${vets.length} vets with consultation fees`);
    
    const updates = [];
    
    for (const vet of vets) {
      const currentFee = vet.consultation_fee || 0;
      
      // Only update if the current fee is less than 121 or a reasonable amount that suggests it doesn't include service fee
      // Most consultation fees without service fee would be under 2000, so we'll update those
      if (currentFee < 2000) {
        const newFee = currentFee + 121;
        console.log(`Updating Dr. ${vet.first_name} ${vet.last_name}: ₹${currentFee} → ₹${newFee}`);
        
        updates.push({
          id: vet.id,
          consultation_fee: newFee,
          name: `${vet.first_name} ${vet.last_name}`
        });
      } else {
        console.log(`Skipping Dr. ${vet.first_name} ${vet.last_name}: ₹${currentFee} (already seems to include service fee)`);
      }
    }
    
    if (updates.length > 0) {
      console.log(`\nUpdating ${updates.length} vet consultation fees...\n`);
      
      // Update consultation fees individually to track progress
      let successful = 0;
      let failed = 0;
      
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('vet_profiles')
          .update({ consultation_fee: update.consultation_fee })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`❌ Error updating Dr. ${update.name}:`, updateError);
          failed++;
        } else {
          console.log(`✅ Updated Dr. ${update.name} successfully`);
          successful++;
        }
      }
      
      console.log(`\n📊 Update Summary:`);
      console.log(`✅ Successfully updated: ${successful} vets`);
      console.log(`❌ Failed to update: ${failed} vets`);
      console.log(`💰 Service fee of ₹121 added to all updated consultation fees`);
      
    } else {
      console.log('No consultation fees needed updating');
    }
    
  } catch (error) {
    console.error('Error updating consultation fees:', error);
  }
}

updateConsultationFees(); 